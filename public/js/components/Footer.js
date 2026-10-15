export default function Footer() {
  const React = window.React;
  const h = React.createElement;
  const anio = new Date().getFullYear();

  return h('footer', { id: 'contacto', className: 'piePagina' },
    h('div', { className: 'contenido' },
      h('div', { className: 'marca' },
        h('a', { href: '#', className: 'logo', onClick: (e) => { e.preventDefault(); window.location.hash = ''; } },
          h('span', { className: 'logoIcono' }, '🧪'),
          h('span', { className: 'logoTexto' }, 'Pancholab')
        ),
        h('p', null, 'El laboratorio donde los panchos se convierten en experiencias gastronómicas únicas, fusionando sabores del mundo con técnicas de laboratorio y conciencia ecológica.'),
        h('div', { className: 'redes' },
          h('a', { href: 'https://instagram.com', target: '_blank', rel: 'noopener noreferrer', className: 'redSocial', 'aria-label': 'Instagram' }, '📷'),
          h('a', { href: 'https://facebook.com', target: '_blank', rel: 'noopener noreferrer', className: 'redSocial', 'aria-label': 'Facebook' }, '📘'),
          h('a', { href: 'https://tiktok.com', target: '_blank', rel: 'noopener noreferrer', className: 'redSocial', 'aria-label': 'TikTok' }, '🎵')
        )
      ),
      h('div', { className: 'columna' },
        h('h4', null, 'Explorar'),
        h('ul', { className: 'lista' },
          h('li', null, h('a', { href: '#', onClick: (e) => { e.preventDefault(); window.location.hash = ''; } }, 'Inicio')),
          h('li', null, h('a', { href: '#productos', onClick: (e) => { e.preventDefault(); window.location.hash = '/productos'; } }, 'Productos'))
        )
      ),
      h('div', { className: 'columna' },
        h('h4', null, 'Categorías'),
        h('ul', { className: 'lista' },
          h('li', null, h('a', { href: '#productos' }, 'Panchos')),
          h('li', null, h('a', { href: '#productos' }, 'Bebidas'))
        )
      ),
      h('div', { className: 'columna' },
        h('h4', null, 'Contacto'),
        h('ul', { className: 'lista' },
          h('li', null, '📍 Colonia, Uruguay'),
          h('li', null, '📧 hola@pancholab.com'),
          h('li', null, '📱 111-11-11-11')
        )
      )
    ),
    h('div', { className: 'inferior' },
      h('p', { className: 'copyright' }, `&copy; ${anio} Pancholab. Todos los derechos reservados.`),
      h('div', { className: 'legal' },
        h('a', { href: '#privacidad' }, 'Política de privacidad'),
        h('a', { href: '#terminos' }, 'Términos y condiciones'),
        h('a', { href: '/login', className: 'acceso-secreto' }, 'Acceso administrador')
      )
    )
  );
}
