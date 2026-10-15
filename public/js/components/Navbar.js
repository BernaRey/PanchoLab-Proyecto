export default function Navbar({ usuario, navegar }) {
  const React = window.React;
  const h = React.createElement;

  const esAdmin = usuario && usuario.role === 'admin';

  return h('header', { className: 'barra' },
    h('div', { className: 'contenedor' },
      h('a', {
        href: '#',
        className: 'logo',
        onClick: (e) => { e.preventDefault(); navegar('/'); },
      },
        h('span', { className: 'logoIcono' }, '🧪'),
        h('span', { className: 'logoTexto' }, 'Pancholab')
      ),
      h('nav', { className: 'navegacion' },
        h('a', {
          href: '#',
          className: 'activo',
          onClick: (e) => { e.preventDefault(); navegar('/'); },
        }, 'Inicio'),
        h('a', {
          href: '#productos',
          className: '',
          onClick: (e) => { e.preventDefault(); navegar('/productos'); },
        }, 'Productos')
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.8rem' } },
        [
          h('a', { key: 'admin-secreto', href: '#acceso-admin', className: 'boton boton-secundario', onClick: (e) => { e.preventDefault(); navegar('/login'); } }, 'Acceso')
        ]
      )
    )
  );
}
