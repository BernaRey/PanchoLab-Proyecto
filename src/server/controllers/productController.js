import { Product } from '../models/Product.js';
import { esIdValido } from '../middleware/errorHandler.js';

function requiereBaseDeDatos(req, res) {
  if (!req.dbConectado) {
    return res.status(503).json({
      exito: false,
      mensaje: 'Base de datos no disponible. Configura MongoDB y reinicia el servidor.',
    });
  }
  return false;
}

export async function listar(req, res) {
  if (requiereBaseDeDatos(req, res)) return;
  try {
    const filtro = {};
    if (req.query.category) filtro.category = req.query.category;
    if (req.query.isActive !== undefined) filtro.isActive = req.query.isActive === 'true';
    const datos = await Product.find(filtro).sort({ createdAt: -1 }).lean();
    return res.json({ exito: true, cantidad: datos.length, datos });
  } catch (err) {
    return res.status(500).json({ exito: false, mensaje: err.message || 'Error al listar productos' });
  }
}

export async function obtener(req, res) {
  if (requiereBaseDeDatos(req, res)) return;
  try {
    if (!esIdValido(req.params.id)) {
      return res.status(400).json({ exito: false, mensaje: 'ID de producto inválido' });
    }
    const producto = await Product.findById(req.params.id).lean();
    if (!producto) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }
    return res.json({ exito: true, datos: producto });
  } catch (err) {
    return res.status(500).json({ exito: false, mensaje: err.message || 'Error al obtener producto' });
  }
}

export async function crear(req, res) {
  if (requiereBaseDeDatos(req, res)) return;
  try {
    const producto = new Product(req.body.datosValidos);
    const guardado = await producto.save();
    return res.status(201).json({ exito: true, datos: guardado });
  } catch (err) {
    return res.status(400).json({ exito: false, mensaje: err.message || 'Error al crear producto' });
  }
}

export async function actualizar(req, res) {
  if (requiereBaseDeDatos(req, res)) return;
  try {
    if (!esIdValido(req.params.id)) {
      return res.status(400).json({ exito: false, mensaje: 'ID de producto inválido' });
    }
    const actualizado = await Product.findByIdAndUpdate(
      req.params.id,
      req.body.datosValidos,
      { new: true, runValidators: true }
    ).lean();
    if (!actualizado) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }
    return res.json({ exito: true, datos: actualizado });
  } catch (err) {
    return res.status(400).json({ exito: false, mensaje: err.message || 'Error al actualizar producto' });
  }
}

export async function eliminar(req, res) {
  if (requiereBaseDeDatos(req, res)) return;
  try {
    if (!esIdValido(req.params.id)) {
      return res.status(400).json({ exito: false, mensaje: 'ID de producto inválido' });
    }
    const eliminado = await Product.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }
    return res.json({ exito: true, mensaje: 'Producto eliminado', datos: eliminado });
  } catch (err) {
    return res.status(500).json({ exito: false, mensaje: err.message || 'Error al eliminar producto' });
  }
}
