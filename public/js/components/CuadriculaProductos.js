export default function CuadriculaProductos({ productos, cargando, error, usuario, navegar }) {
  const React = window.React;
  const h = React.createElement;

  if (cargando) return h(SpinnerCarga);
  if (error) return h(MensajeError, { mensaje: error });
  if (!productos || productos.length === 0) return h(EstadoVacio);

  return h('div', { className: 'cuadricula' },
    productos.map((producto) =>
      h(TarjetaProducto, { key: producto._id || producto.id, producto, usuario, navegar })
    )
  );
}

function SpinnerCarga() {
  const React = window.React;
  const h = React.createElement;
  return h('div', { className: 'estado spinnerCarga' },
    h('div', { className: 'iconoGrande' }, '🔬'),
    h('h3', { className: 'tituloEstado' }, 'Cargando experimentos...'),
    h('p', { className: 'mensajeEstado' }, 'Esperando la respuesta del servidor.')
  );
}

function MensajeError({ mensaje }) {
  const React = window.React;
  const h = React.createElement;
  return h('div', { className: 'estado mensajeError', role: 'alert' },
    h('div', { className: 'iconoGrande' }, '⚠️'),
    h('h3', { className: 'tituloEstado' }, 'Error al cargar'),
    h('p', { className: 'mensajeEstado' }, mensaje),
    h('p', { className: 'mensajeEstado' }, 'Verificá que el servidor esté corriendo.')
  );
}

function EstadoVacio() {
  const React = window.React;
  const h = React.createElement;
  return h('div', { className: 'estado estadoVacio' },
    h('div', { className: 'iconoGrande' }, '🔬'),
    h('h3', { className: 'tituloEstado' }, 'No hay experimentos'),
    h('p', { className: 'mensajeEstado' }, 'No se encontraron productos en esta categoría.')
  );
}
