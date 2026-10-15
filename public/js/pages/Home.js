import { productos as apiProductos } from '../services/api.js';
import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';
import FiltroCategoria from '../components/FiltroCategoria.js';
import CuadriculaProductos from '../components/CuadriculaProductos.js';

export default function Home({ usuario, navegar }) {
  const React = window.React;
  const h = React.createElement;
  const [lista, setLista] = React.useState([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [categoria, setCategoria] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        setError(null);
        const respuesta = await apiProductos.listar(categoria);
        setLista(respuesta.datos || respuesta.productos || []);
      } catch (e) {
        setError(e.message || 'No se pudieron cargar los productos');
      } finally {
        setCargando(false);
      }
    })();
  }, [categoria]);

  return h('div', { className: 'pagina' },
    h(Navbar, { usuario, navegar }),

    h('main', null,
      h('section', { id: 'inicio', className: 'hero' },
        h('div', { className: 'fondoHero', style: { backgroundImage: 'url(https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1920&q=80)' } }),
        h('div', { className: 'fondoRejilla' }),
        h('div', { className: 'overlayHero' }),
        h('div', { className: 'contenido' },
          h('div', { className: 'etiqueta' },
            h('span', { className: 'etiquetaIcono' }, '🧪'),
            h('span', null, 'Laboratorio gastronómico')
          ),
          h('h1', { className: 'hero-titulo' },
            h('span', null, 'PANCHOLAB'),
            h('br', null),
            h('span', { style: { fontWeight: 400, color: 'var(--neon-cian)' } }, 'Sabores del mundo')
          ),
          h('p', { className: 'hero-descripcion' },
            'Panchos inspirados en las mejores cocinas del mundo, preparados con técnica de laboratorio y pasión por el sabor.'
          ),
          h('div', { className: 'acciones' },
            h('a', {
              href: '#productos',
              className: 'boton boton-primario',
              onClick: (e) => { e.preventDefault(); navegar('/productos'); },
            }, 'Ver el menú'),
            h('a', {
              href: '#concepto',
              className: 'boton boton-secundario',
              onClick: (e) => { e.preventDefault(); navegar('/concepto'); },
            }, 'Nuestro concepto')
          )
        )
      ),

      h('section', { id: 'productos', className: 'seccion seccion-oscura' },
        h('div', { className: 'seccion-contenedor' },
          h('div', { className: 'encabezado-seccion' },
            h('div', { className: 'etiqueta' }, 'Menú'),
            h('h2', null, 'Nuestros panchos'),
            h('p', null, 'Cada pancho es un experimento de sabor. Elige tu favorito.')
          ),
          h(FiltroCategoria, { categoriaActiva: categoria, onCambiarCategoria: setCategoria }),
          h(CuadriculaProductos, { productos: lista, cargando, error, usuario, navegar })
        )
      ),

      h('section', { id: 'concepto', className: 'seccion' },
        h('div', { className: 'seccion-contenedor' },
          h('div', { className: 'encabezado-seccion' },
            h('div', { className: 'etiqueta' }, 'Concepto'),
            h('h2', null, 'Más que un pancho'),
            h('p', null, 'En Pancholab fusionamos la precisión de un laboratorio con los sabores más auténticos del mundo.')
          ),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--espaciado-l)' } },
            h('div', { className: 'tarjeta-caracteristica' },
              h('div', { style: { fontSize: '2.5rem', marginBottom: 'var(--espaciado-s)' } }, '🌍'),
              h('h3', null, 'Sabores del mundo'),
              h('p', null, 'Cada pancho está inspirado en una cultura diferente.')
            ),
            h('div', { className: 'tarjeta-caracteristica' },
              h('div', { style: { fontSize: '2.5rem', marginBottom: 'var(--espaciado-s)' } }, '🔬'),
              h('h3', null, 'Técnica de laboratorio'),
              h('p', null, 'Mediciones exactas, temperaturas controladas, combinaciones experimentales.')
            ),
            h('div', { className: 'tarjeta-caracteristica' },
              h('div', { style: { fontSize: '2.5rem', marginBottom: 'var(--espaciado-s)' } }, '🌱'),
              h('h3', null, 'Conciencia ecológica'),
              h('p', null, 'Ingredientes locales y prácticas sostenibles en cada bocado.')
            ),
            h('div', { className: 'tarjeta-caracteristica' },
              h('div', { style: { fontSize: '2.5rem', marginBottom: 'var(--espaciado-s)' } }, '⚡'),
              h('h3', null, 'Experiencia única'),
              h('p', null, 'Sabor, ciencia y cultura en cada pancho.')
            )
          )
        )
      )
    ),

    h(Footer, null)
  );
}
