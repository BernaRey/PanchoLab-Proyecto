export default function Navbar({ usuario, navegar }) {
  const React = window.React;
  const h = React.createElement;
  const [scrollY, setScrollY] = React.useState(0);
  const [oculto, setOculto] = React.useState(false);
  let ultimoScrollY = 0;

  React.useEffect(() => {
    const manejarScroll = () => {
      const y = window.scrollY;
      setScrollY(y);

      if (y > ultimoScrollY && y > 50) {
        setOculto(true);
      } else if (y < ultimoScrollY) {
        setOculto(false);
      }
      ultimoScrollY = y;
    };

    window.addEventListener('scroll', manejarScroll);
    return () => window.removeEventListener('scroll', manejarScroll);
  }, []);

  const claseBarra = scrollY > 0 ? 'barra scrolled' : 'barra';
  const claseFinal = oculto ? claseBarra + ' oculto' : claseBarra;

  return h('header', { className: claseFinal },
    h('div', { className: 'contenedor' },
      h('div', { className: 'barra-contenido' },
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
        )
      )
    )
  );
}
