import { randomUUID } from 'node:crypto';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { esIdValido } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';

class ErrorCheckout extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

function validarPedido(body) {
  const cliente = body?.cliente && typeof body.cliente === 'object' && !Array.isArray(body.cliente)
    ? body.cliente
    : {};
  const nombre = typeof cliente.nombre === 'string' ? cliente.nombre.trim() : '';
  const direccion = typeof cliente.direccion === 'string' ? cliente.direccion.trim() : '';
  const notas = cliente.notas === undefined
    ? ''
    : typeof cliente.notas === 'string'
      ? cliente.notas.trim()
      : null;
  const articulos = body?.articulos;

  if (nombre.length < 2 || nombre.length > 80) {
    throw new ErrorCheckout(400, 'El nombre debe tener entre 2 y 80 caracteres.');
  }
  if (direccion.length < 5 || direccion.length > 200) {
    throw new ErrorCheckout(400, 'La dirección debe tener entre 5 y 200 caracteres.');
  }
  if (notas === null || notas.length > 500) {
    throw new ErrorCheckout(400, 'Las notas no pueden superar los 500 caracteres.');
  }
  if (!Array.isArray(articulos) || articulos.length < 1 || articulos.length > 20) {
    throw new ErrorCheckout(400, 'El pedido debe incluir entre 1 y 20 productos distintos.');
  }

  const ids = new Set();
  const articulosValidados = articulos.map((articulo) => {
    const productoId = typeof articulo?.productoId === 'string' ? articulo.productoId : '';
    const cantidad = articulo?.cantidad;

    if (!esIdValido(productoId)) {
      throw new ErrorCheckout(400, 'El pedido contiene un producto inválido.');
    }
    if (ids.has(productoId)) {
      throw new ErrorCheckout(400, 'El pedido no puede repetir productos.');
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
      throw new ErrorCheckout(400, 'Cada cantidad debe ser un número entero entre 1 y 99.');
    }

    ids.add(productoId);
    return { productoId, cantidad };
  });

  return { cliente: { nombre, direccion, notas }, articulos: articulosValidados };
}

function obtenerTelefonoVendedor() {
  const telefono = String(env.whatsappVendedor || '').replace(/\D/g, '');
  if (telefono.length < 8 || telefono.length > 15) {
    throw new ErrorCheckout(
      503,
      'El número de WhatsApp del vendedor no está configurado correctamente.'
    );
  }
  return telefono;
}

function formatoPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(valor);
}

function generarEnlaceWhatsapp(telefono, cliente, articulos, total) {
  const detalle = articulos
    .map(({ producto, cantidad }) => `${cantidad}x ${producto.name}`)
    .join('\n');
  const notas = cliente.notas ? `\nNotas: ${cliente.notas}` : '';
  const mensaje = [
    '*¡Hola Pancholab! Mi pedido es:*',
    detalle,
    `*Total: ${formatoPrecio(total)}*`,
    '*Pago: Efectivo*',
    '',
    '*Datos de entrega:*',
    `Nombre: ${cliente.nombre}`,
    `Dirección: ${cliente.direccion}${notas}`,
  ].join('\n');

  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
}

function tiendaCerrada() {
  return User.findOne({ role: 'admin' })
    .select('tiendaAbierta')
    .lean()
    .then((administrador) => administrador?.tiendaAbierta === false);
}

async function compensarDescuentos(articulosDescontados) {
  const errores = [];

  for (const articulo of [...articulosDescontados].reverse()) {
    try {
      const resultado = await Product.updateOne(
        { _id: articulo.productoId },
        { $inc: { stock: articulo.cantidad } }
      );
      if (resultado.matchedCount !== 1) {
        errores.push(`No se pudo restaurar el stock del producto ${articulo.productoId}.`);
      }
    } catch (error) {
      errores.push(`No se pudo restaurar el producto ${articulo.productoId}: ${error.message}`);
    }
  }

  return errores;
}

export async function confirmarPedido(req, res) {
  if (!req.dbConectado) {
    return res.status(503).json({
      exito: false,
      mensaje: 'La base de datos no está disponible para confirmar el pedido.',
    });
  }

  let pedido;
  let telefono;
  try {
    pedido = validarPedido(req.body);
    telefono = obtenerTelefonoVendedor();
  } catch (error) {
    if (error instanceof ErrorCheckout) {
      return res.status(error.status).json({ exito: false, mensaje: error.message });
    }
    throw error;
  }

  const referencia = randomUUID();
  try {
    if (await tiendaCerrada()) {
      throw new ErrorCheckout(409, 'La tienda está cerrada y no puede recibir pedidos.');
    }

    const articulosDescontados = [];
    const articulosConfirmados = [];
    let total = 0;
    let urlWhatsapp;

    try {
      for (const articulo of pedido.articulos) {
        const producto = await Product.findOneAndUpdate(
          {
            _id: articulo.productoId,
            isActive: true,
            stock: { $gte: articulo.cantidad },
          },
          { $inc: { stock: -articulo.cantidad } },
          { new: true, runValidators: true }
        ).lean();

        if (!producto) {
          const actual = await Product.findById(articulo.productoId)
            .select('name stock isActive')
            .lean();
          if (!actual || actual.isActive === false) {
            throw new ErrorCheckout(409, 'Uno de los productos ya no está disponible.');
          }
          throw new ErrorCheckout(
            409,
            `Stock insuficiente para ${actual.name}. Disponibles: ${actual.stock}.`
          );
        }

        articulosDescontados.push(articulo);
        articulosConfirmados.push({ producto, cantidad: articulo.cantidad });
        total += Number(producto.price) * articulo.cantidad;
      }
      urlWhatsapp = generarEnlaceWhatsapp(
        telefono,
        pedido.cliente,
        articulosConfirmados,
        total
      );
    } catch (error) {
      const erroresCompensacion = await compensarDescuentos(articulosDescontados);
      if (erroresCompensacion.length > 0) {
        console.error(JSON.stringify({
          evento: 'checkout_compensacion_fallida',
          referencia,
          motivo: error.message,
          articulos: articulosDescontados,
          errores: erroresCompensacion,
        }));
        return res.status(500).json({
          exito: false,
          referencia,
          mensaje: `El pedido no se completó y hubo un error al restaurar el stock. Contactá al vendedor con la referencia ${referencia} para verificar la disponibilidad.`,
        });
      }
      if (articulosDescontados.length > 0) {
        console.warn(JSON.stringify({
          evento: 'checkout_compensacion_completada',
          referencia,
          motivo: error.message,
          articulos: articulosDescontados,
        }));
      }
      if (error instanceof ErrorCheckout) {
        return res.status(error.status).json({
          exito: false,
          referencia,
          mensaje: error.message,
        });
      }
      throw error;
    }

    console.info(JSON.stringify({
      evento: 'checkout_stock_descontado',
      referencia,
      articulos: articulosDescontados,
      total,
    }));
    return res.json({
      exito: true,
      mensaje: 'Pedido confirmado. Se abrirá WhatsApp para enviarlo al vendedor.',
      referencia,
      total,
      urlWhatsapp,
    });
  } catch (error) {
    if (error instanceof ErrorCheckout) {
      return res.status(error.status).json({
        exito: false,
        referencia,
        mensaje: error.message,
      });
    }
    return res.status(500).json({
      exito: false,
      referencia,
      mensaje: error.message || 'No se pudo confirmar el pedido.',
    });
  }
}
