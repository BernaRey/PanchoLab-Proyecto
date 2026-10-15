export default function FiltroCategoria({ categoriaActiva, onCambiarCategoria }) {
  const React = window.React;
  const h = React.createElement;
  const categorias = [
    { id: null, nombre: 'Todos', icono: '🧪' },
    { id: 'panchos', nombre: 'Panchos', icono: '🌭' },
    { id: 'bebidas', nombre: 'Bebidas', icono: '🥤' },
  ];

  return h('div', { className: 'filtro' },
    categorias.map((categoria) =>
      h('button', {
        key: categoria.id,
        className: `botonCategoria ${categoriaActiva === categoria.id ? 'botonActivo' : ''}`,
        onClick: () => onCambiarCategoria(categoria.id),
      },
        h('span', { className: 'icono' }, categoria.icono),
        h('span', { className: 'nombre' }, categoria.nombre)
      )
    )
  );
}
