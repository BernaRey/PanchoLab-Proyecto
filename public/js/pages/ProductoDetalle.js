import { productos as apiProductos } from '../services/api.js';
import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';

export default function ProductoDetalle({ id, usuario, navegar }) {
  const React = window.React;
  const h = React.createElement;
  const [producto, setProducto] = React.useState(null);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        setError(null);
        const respuesta = await apiProductos.obtener(id);
        setProducto(respuesta.datos || respuesta);
      } catch (e) {
        setError(e.message || 'No se pudo cargar el producto');
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  const contenido = h('div', { className: 'contenedor' },
    h('h1', null, producto ? producto.name : 'Producto'),
    h('p', null, producto ? producto.description : ''),
    producto ? h('p', null, `Precio: $${producto.price}  |  Stock: ${producto.stock}  |  Categoría: ${producto.category}`) : null,
    h('button', {
      className: 'boton boton-secundario',
      onClick: () => navegar('/'),
    }, 'Volver al catálogo')
  );

  if (cargando) {
    return h('div', { className: 'pagina' },
      h(Navbar, { usuario, navegar }),
      h('main', null, h('div', { className: 'estado spinnerCarga' },
        h('div', { className: 'iconoGrande' }, '🔬'),
        h('h3', null, 'Cargando producto...')
      )),
      h(Footer, null)
    );
  }

  if (error || !producto) {
    return h('div', { className: 'pagina' },
      h(Navbar, { usuario, navegar }),
      h('main', null, h('div', { className: 'estado mensajeError', role: 'alert' },
        h('div', { className: 'iconoGrande' }, '⚠️'),
        h('h3', null, 'Producto no encontrado'),
        h('p', null, error || 'El producto solicitado no existe.'),
        h('button', {
          className: 'boton boton-primario',
          onClick: () => navegar('/'),
        }, 'Volver al catálogo')
      )),
      h(Footer, null)
    );
  }

  return h('div', { className: 'pagina' },
    h(Navbar, { usuario, navegar }),
    h('main', null, h('div', { style: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' } }, contenido)),
    h(Footer, null)
  );
}
