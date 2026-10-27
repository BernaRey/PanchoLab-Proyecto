import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';

export default function Home({ usuario, navegar }) {
  const React = window.React;
  const h = React.createElement;

  const panchos = [
    {
      nombre: 'El Argentino',
      descripcion: 'Salchicha criolla, chimichurri, provolone y cebolla caramelizada. Un clásico de la parrilla en pan.',
      precio: '$5.90',
      imagen: 'https://images.unsplash.com/photo-1559338352-bf4990826b6c?q=80&w=800&auto=format&fit=crop',
      lado: 'izq'
    },
    {
      nombre: 'El Uruguayo',
      descripcion: 'Salchicha de cerdo, huevo a la plancha, panceta crocante y salsa golf.',
      precio: '$6.20',
      imagen: 'https://images.unsplash.com/photo-1532926643949-3e674f7b96c1?q=80&w=800&auto=format&fit=crop',
      lado: 'der'
    },
    {
      nombre: 'El Chileno',
      descripcion: 'Completo: salchicha, tomate, palta, mayonesa y merkén.',
      precio: '$5.70',
      imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
      lado: 'izq'
    },
    {
      nombre: 'El Brazuca',
      descripcion: 'Salchicha con puré de papas, maíz, batata paja y salsa vinagrete.',
      precio: '$6.50',
      imagen: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop',
      lado: 'der'
    },
    {
      nombre: 'El Mexicano',
      descripcion: 'Salchicha con jalapeños, guacamole, cebolla morada y crema agria.',
      precio: '$6.00',
      imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
      lado: 'izq'
    },
    {
      nombre: 'El Venezolano',
      descripcion: 'Salchicha con queso amarillo, aguacate, tomate y salsa rosada.',
      precio: '$5.80',
      imagen: 'https://images.unsplash.com/photo-1553979459-d22d9ba6443b?q=80&w=800&auto=format&fit=crop',
      lado: 'der'
    }
  ];

  return h('div', { className: 'pagina' },
    h(Navbar, { usuario, navegar }),

    h('main', null,

      // HERO
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
              onClick: (e) => { e.preventDefault(); navegar('/productos'); }
            }, 'Ver el menú')
          )
        )
      ),

      // SECCIÓN INFORMATIVA DE PRODUCTOS (visible al hacer scroll)
      h('section', { id: 'productos-info', className: 'seccion seccion-oscura' },
        h('div', { className: 'seccion-contenedor' },
          h('div', { className: 'encabezado-seccion' },
            h('div', { className: 'etiqueta' }, 'Nuestros panchos'),
            h('h2', null, 'Sabores de cada país'),
            h('p', null, 'Cada pancho es un viaje. Elige el tuyo.')
          ),
          h('div', { className: 'grid-productos-info' },
            panchos.map((p) =>
              h('div', { key: p.nombre, className: 'producto-info ' + p.lado },
                p.lado === 'izq'
                  ? h(React.Fragment, null,
                      h('div', { className: 'imagen-pancho' },
                        h('img', { src: p.imagen, alt: p.nombre, draggable: 'false' })
                      ),
                      h('div', { className: 'texto-pancho' },
                        h('h3', null, p.nombre),
                        h('p', null, p.descripcion),
                        h('span', { className: 'precio-pancho' }, p.precio)
                      )
                    )
                  : h(React.Fragment, null,
                      h('div', { className: 'texto-pancho' },
                        h('h3', null, p.nombre),
                        h('p', null, p.descripcion),
                        h('span', { className: 'precio-pancho' }, p.precio)
                      ),
                      h('div', { className: 'imagen-pancho' },
                        h('img', { src: p.imagen, alt: p.nombre, draggable: 'false' })
                      )
                    )
              )
            )
          )
        )
      ),

      // Y MÁS!! con flecha al menú
      h('section', { id: 'mas', className: 'seccion' },
        h('div', { className: 'seccion-contenedor' },
          h('div', { className: 'mas-contenedor' },
            h('div', { className: 'mas-texto' },
              h('h2', null, 'Y MÁS!!'),
              h('p', null, 'Descubre todos nuestros panchos y bebidas en el menú completo.')
            ),
            h('a', {
              href: '#productos',
              className: 'boton boton-primario mas-boton',
              onClick: (e) => { e.preventDefault(); navegar('/productos'); }
            },
              h('span', null, 'Ir al menú'),
              h('span', { className: 'flecha' }, '→')
            )
          )
        )
      )

    ),

    h(Footer, null)
  );
}
