import React, { useCallback, useEffect, useState } from 'react';
import { auth, productos as apiProductos } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.js';
import FormularioProductoModal from '../components/FormularioProductoModal.jsx';
import { formatearPrecio } from '../utilidades/formatearPrecio.js';

export default function PanelAdmin({
  usuario,
  navegar,
  onAuth,
  tema,
  alCambiarTema,
  cantidadCarrito,
  alAbrirCarrito,
  tiendaAbierta,
  cargandoTienda,
  cambiandoTienda,
  errorTienda,
  onCambiarTienda,
}) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [esMensajeError, setEsMensajeError] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [productoEliminando, setProductoEliminando] = useState('');

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');

    try {
      const respuesta = await apiProductos.listar();
      if (!Array.isArray(respuesta.datos)) {
        throw new Error('La respuesta de productos no tiene el formato esperado.');
      }
      setProductos(respuesta.datos);
    } catch (error) {
      setErrorCarga(error.message || 'No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarProductos();
  }, [cargarProductos]);

  function abrirNuevoProducto() {
    setProductoEditando(null);
    setErrorFormulario('');
    setModalAbierto(true);
  }

  function abrirEdicion(producto) {
    setProductoEditando(producto);
    setErrorFormulario('');
    setModalAbierto(true);
  }

  async function guardarProducto(datos) {
    setGuardando(true);
    setErrorFormulario('');
    setMensaje('');

    try {
      if (productoEditando) {
        await apiProductos.actualizar(productoEditando._id || productoEditando.id, datos);
        setMensaje('Producto actualizado correctamente.');
      } else {
        await apiProductos.crear(datos);
        setMensaje('Producto creado correctamente.');
      }
      setEsMensajeError(false);
      setModalAbierto(false);
      await cargarProductos();
      return true;
    } catch (error) {
      setErrorFormulario(error.message || 'No se pudo guardar el producto.');
      return false;
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProducto(producto) {
    const id = producto._id || producto.id;
    const confirmar = window.confirm(`¿Querés eliminar "${producto.name}"?`);
    if (!confirmar) return;

    setProductoEliminando(id);
    setMensaje('');
    try {
      await apiProductos.eliminar(id);
      setMensaje(`Se eliminó "${producto.name}".`);
      setEsMensajeError(false);
      await cargarProductos();
    } catch (error) {
      setMensaje(error.message || 'No se pudo eliminar el producto.');
      setEsMensajeError(true);
    } finally {
      setProductoEliminando('');
    }
  }

  async function cerrarSesion() {
    try {
      await auth.logout();
      if (onAuth) await onAuth();
      navegar('/login');
    } catch (error) {
      setMensaje(error.message || 'No se pudo cerrar la sesión.');
      setEsMensajeError(true);
    }
  }

  async function alternarEstadoTienda() {
    const resultado = await onCambiarTienda();
    setMensaje(resultado.mensaje);
    setEsMensajeError(!resultado.exito);
  }

  return (
    <div className="pagina">
      <Navbar
        usuario={usuario}
        navegar={navegar}
        tema={tema}
        alCambiarTema={alCambiarTema}
        cantidadCarrito={cantidadCarrito}
        alAbrirCarrito={alAbrirCarrito}
        tiendaAbierta={tiendaAbierta}
        cargandoTienda={cargandoTienda}
        errorTienda={errorTienda}
      />

      <main>
        <section className="panelAdmin" aria-labelledby="titulo-panel-admin">
          <header className="panelHeader">
            <h1 id="titulo-panel-admin">Administración de productos</h1>
            <div className="adminActions">
              <button
                type="button"
                className="botonVolver"
                onClick={() => navegar('/')}
              >
                Volver a la tienda
              </button>
              <button
                type="button"
                className="botonNuevo"
                onClick={abrirNuevoProducto}
              >
                Agregar producto
              </button>
              <button
                type="button"
                className={`interruptor-tienda ${tiendaAbierta ? 'tienda-abierta' : 'tienda-cerrada'}`}
                aria-pressed={tiendaAbierta}
                disabled={cargandoTienda || cambiandoTienda}
                onClick={alternarEstadoTienda}
              >
                {cargandoTienda
                  ? 'Verificando tienda...'
                  : cambiandoTienda
                    ? 'Actualizando...'
                    : tiendaAbierta
                      ? 'Cerrar tienda'
                      : 'Abrir tienda'}
              </button>
              <button
                type="button"
                className="boton boton-secundario"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>
            </div>
          </header>

          <p
            className={`estado-tienda-admin ${tiendaAbierta ? 'tienda-abierta' : 'tienda-cerrada'}`}
            role={errorTienda ? 'alert' : 'status'}
          >
            {errorTienda
              ? errorTienda
              : `Estado de la tienda: ${tiendaAbierta ? 'abierta' : 'cerrada'}.`}
          </p>

          {mensaje && (
            <div
              className={`mensaje ${esMensajeError ? 'mensajeError' : 'mensajeExito'}`}
              role={esMensajeError ? 'alert' : 'status'}
            >
              {mensaje}
            </div>
          )}
          {errorCarga && (
            <div className="mensaje mensajeError" role="alert">
              {errorCarga}
              <button type="button" className="boton-reintentar" onClick={cargarProductos}>
                Reintentar
              </button>
            </div>
          )}

          <div className="tablaAdmin-contenedor">
            <table className="tablaAdmin">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">País / categoría</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="6">Cargando productos...</td>
                  </tr>
                ) : productos.length === 0 ? (
                  <tr>
                    <td colSpan="6">Todavía no hay productos. Agregá el primero.</td>
                  </tr>
                ) : (
                  productos.map((producto) => {
                    const id = producto._id || producto.id;
                    const disponible = producto.isActive !== false && Number(producto.stock) > 0;

                    return (
                      <tr key={id}>
                        <td>
                          <strong>{producto.name}</strong>
                          <span className="descripcion-fila-admin">
                            {producto.description}
                          </span>
                        </td>
                        <td>
                          {producto.country || '—'}
                          <span className="categoria-fila-admin">
                            {producto.category || 'panchos'}
                          </span>
                        </td>
                        <td className="precioAdmin">{formatearPrecio(producto.price)}</td>
                        <td className="stockAdmin">{producto.stock}</td>
                        <td>
                          <span className={disponible ? 'activoSi' : 'activoNo'}>
                            {producto.isActive === false
                              ? 'Inactivo'
                              : disponible
                                ? 'Disponible'
                                : 'Sin stock'}
                          </span>
                        </td>
                        <td className="accionesFila">
                          <button
                            type="button"
                            className="botonEditar"
                            onClick={() => abrirEdicion(producto)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="botonEliminar"
                            disabled={productoEliminando === id}
                            onClick={() => eliminarProducto(producto)}
                          >
                            {productoEliminando === id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />

      {modalAbierto && (
        <FormularioProductoModal
          producto={productoEditando}
          guardando={guardando}
          error={errorFormulario}
          onGuardar={guardarProducto}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}
