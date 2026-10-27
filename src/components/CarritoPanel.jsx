import React, { useEffect } from 'react';
import { useCarrito } from '../contextos/CarritoContexto.jsx';
import { checkout as apiCheckout } from '../services/api.js';
import { formatearPrecio } from '../utilidades/formatearPrecio.js';

export default function CarritoPanel({
  abierto,
  onCerrar,
  tiendaAbierta,
  cargandoTienda,
}) {
  const [checkoutAbierto, setCheckoutAbierto] = React.useState(false);
  const [enviandoPedido, setEnviandoPedido] = React.useState(false);
  const [errorCheckout, setErrorCheckout] = React.useState('');
  const [datosEntrega, setDatosEntrega] = React.useState({
    nombre: '',
    direccion: '',
    notas: '',
  });
  const {
    articulos,
    cantidadTotal,
    total,
    cargandoStock,
    errorStock,
    cambiarCantidad,
    sincronizarStock,
    quitarProducto,
    vaciarCarrito,
  } = useCarrito();

  useEffect(() => {
    if (!abierto) return undefined;

    const overflowAnterior = document.body.style.overflow;

    function cerrarConEscape(evento) {
      if (evento.key === 'Escape') onCerrar();
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', cerrarConEscape);
    };
  }, [abierto, onCerrar]);

  useEffect(() => {
    if (abierto && articulos.length > 0) {
      void sincronizarStock();
    }
  }, [abierto, sincronizarStock]);

  if (!abierto) return null;

  async function confirmarPedido(evento) {
    evento.preventDefault();
    setErrorCheckout('');
    setEnviandoPedido(true);

    try {
      const respuesta = await apiCheckout.confirmarPedido({
        cliente: datosEntrega,
        articulos: articulos.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
      });
      if (
        typeof respuesta.urlWhatsapp !== 'string'
        || !respuesta.urlWhatsapp.startsWith('https://wa.me/')
      ) {
        throw new Error('El servidor no devolvió un enlace de WhatsApp válido.');
      }

      vaciarCarrito();
      window.location.assign(respuesta.urlWhatsapp);
    } catch (error) {
      setErrorCheckout(error.message || 'No se pudo confirmar el pedido.');
    } finally {
      setEnviandoPedido(false);
    }
  }

  return (
    <div className="fondo-carrito" onClick={onCerrar} role="presentation">
      <section
        className="panel-carrito"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-carrito"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="encabezado-carrito">
          <div>
            <h2 id="titulo-carrito">Tu carrito</h2>
            <p>{cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button
            type="button"
            className="boton-cerrar-carrito"
            aria-label="Cerrar carrito"
            onClick={onCerrar}
          >
            ×
          </button>
        </div>

        {articulos.length === 0 ? (
          <div className="carrito-vacio">
            <span aria-hidden="true">🛒</span>
            <p>Tu carrito está vacío. Elegí un sabor para empezar.</p>
          </div>
        ) : (
          <>
            {!tiendaAbierta && !cargandoTienda && (
              <p className="aviso-carrito-cerrado" role="status">
                La tienda está cerrada. No se pueden agregar más productos.
              </p>
            )}
            <ul className="lista-carrito">
              {articulos.map(({ productoId, producto, cantidad }) => {
                const stockDisponible = Math.max(0, Math.floor(Number(producto.stock) || 0));
                const excedeStock = cantidad > stockDisponible || producto.isActive === false;

                return (
                  <li className="articulo-carrito" key={productoId}>
                    {producto.image ? (
                      <img src={producto.image} alt="" className="imagen-carrito" />
                    ) : (
                      <span className="imagen-carrito imagen-carrito-vacia" aria-hidden="true">
                        🌭
                      </span>
                    )}
                    <div className="detalle-carrito">
                      <h3>{producto.name}</h3>
                      <p>{formatearPrecio(producto.price)}</p>
                      {excedeStock && (
                        <p className="aviso-stock-carrito" role="status">
                          {stockDisponible > 0
                            ? `Stock actualizado: quedan ${stockDisponible}. Ajustá la cantidad.`
                            : 'Este producto ya no está disponible.'}
                        </p>
                      )}
                      <div className="controles-cantidad">
                        <button
                          type="button"
                          aria-label={`Restar ${producto.name}`}
                          onClick={() => cambiarCantidad(productoId, cantidad - 1)}
                        >
                          −
                        </button>
                        <span aria-label={`Cantidad: ${cantidad}`}>{cantidad}</span>
                        <button
                          type="button"
                          aria-label={`Sumar ${producto.name}`}
                          disabled={
                            !tiendaAbierta
                            || cargandoTienda
                            || cargandoStock
                            || Boolean(errorStock)
                            || producto.isActive === false
                            || cantidad >= stockDisponible
                          }
                          onClick={() => cambiarCantidad(productoId, cantidad + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="subtotal-carrito">
                      <strong>{formatearPrecio(Number(producto.price) * cantidad)}</strong>
                      <button
                        type="button"
                        className="quitar-carrito"
                        onClick={() => quitarProducto(productoId)}
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="resumen-carrito">
              <button
                type="button"
                className="vaciar-carrito"
                disabled={cargandoStock}
                onClick={() => void sincronizarStock()}
              >
                {cargandoStock ? 'Verificando stock...' : 'Actualizar disponibilidad'}
              </button>
              {errorStock && (
                <p className="aviso-stock-error" role="alert">
                  {errorStock} Volvé a intentar antes de confirmar el pedido.
                </p>
              )}
              <p>
                <span>Total</span>
                <strong>{formatearPrecio(total)}</strong>
              </p>
              {checkoutAbierto ? (
                <form className="formulario-checkout" onSubmit={confirmarPedido}>
                  <h3>Datos de entrega</h3>
                  <label>
                    Nombre
                    <input
                      type="text"
                      autoComplete="name"
                      minLength={2}
                      maxLength={80}
                      required
                      value={datosEntrega.nombre}
                      onChange={(evento) => setDatosEntrega({
                        ...datosEntrega,
                        nombre: evento.target.value,
                      })}
                    />
                  </label>
                  <label>
                    Dirección
                    <input
                      type="text"
                      autoComplete="street-address"
                      minLength={5}
                      maxLength={200}
                      required
                      value={datosEntrega.direccion}
                      onChange={(evento) => setDatosEntrega({
                        ...datosEntrega,
                        direccion: evento.target.value,
                      })}
                    />
                  </label>
                  <label>
                    Notas de entrega
                    <textarea
                      maxLength={500}
                      rows={3}
                      value={datosEntrega.notas}
                      onChange={(evento) => setDatosEntrega({
                        ...datosEntrega,
                        notas: evento.target.value,
                      })}
                    />
                  </label>
                  <p className="aviso-checkout">Medio de pago: efectivo.</p>
                  {errorCheckout && (
                    <p className="aviso-stock-error" role="alert">{errorCheckout}</p>
                  )}
                  <button
                    type="submit"
                    className="boton-confirmar-pedido"
                    disabled={
                      enviandoPedido
                      || !tiendaAbierta
                      || cargandoTienda
                      || cargandoStock
                      || Boolean(errorStock)
                      || articulos.some(({ producto, cantidad }) => (
                        producto.isActive === false
                        || cantidad > Math.max(0, Math.floor(Number(producto.stock) || 0))
                      ))
                    }
                  >
                    {enviandoPedido ? 'Confirmando pedido...' : 'Confirmar pedido por WhatsApp'}
                  </button>
                  <button
                    type="button"
                    className="vaciar-carrito"
                    disabled={enviandoPedido}
                    onClick={() => {
                      setCheckoutAbierto(false);
                      setErrorCheckout('');
                    }}
                  >
                    Volver al carrito
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="boton-confirmar-pedido"
                  disabled={
                    !tiendaAbierta
                    || cargandoTienda
                    || cargandoStock
                    || Boolean(errorStock)
                    || articulos.some(({ producto, cantidad }) => (
                      producto.isActive === false
                      || cantidad > Math.max(0, Math.floor(Number(producto.stock) || 0))
                    ))
                  }
                  onClick={() => {
                    setErrorCheckout('');
                    setCheckoutAbierto(true);
                  }}
                >
                  {cargandoTienda
                    ? 'Verificando tienda...'
                    : !tiendaAbierta
                      ? 'TIENDA CERRADA'
                      : cargandoStock
                        ? 'Verificando stock...'
                        : 'Terminar pedido'}
                </button>
              )}
              <button
                type="button"
                className="vaciar-carrito"
                disabled={enviandoPedido}
                onClick={vaciarCarrito}
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
