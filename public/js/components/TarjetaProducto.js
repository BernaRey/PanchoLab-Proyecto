export default function TarjetaProducto({ producto, usuario, navegar }) {
  const React = window.React;
  const h = React.createElement;
  const disponible = producto.available !== false && producto.isActive !== false;

  return h('article', { className: 'tarjeta' },
    h('div', { className: 'cabecera' },
      h('span', { className: 'codigo' }, producto.codigo || producto._id),
      h('span', {
        className: `disponibilidad ${disponible ? 'disponible' : 'noDisponible'}`,
      }, disponible ? 'Disponible' : 'Agotado')
    ),
    h('div', { className: 'imagenContenedor' },
      h('img', {
        src: producto.image,
        alt: producto.name,
        className: 'imagen',
        loading: 'lazy',
      }),
      h('div', { className: 'overlay' })
    ),
    h('div', { className: 'contenido' },
      h('div', { className: 'ubicacion' },
        h('span', { className: 'bandera' }, '🌍'),
        h('span', { className: 'pais' }, producto.country || '')
      ),
      h('h3', { className: 'nombre' }, producto.name),
      h('p', { className: 'descripcion' }, producto.description),
      h('div', { className: 'ingredientes' },
        h('span', { className: 'ingredientesEtiqueta' }, 'Ingredientes:'),
        h('div', { className: 'ingredientesLista' },
          (producto.ingredients || []).slice(0, 3).map((ing, i) =>
            h('span', { key: i, className: 'ingrediente' }, ing)
          ),
          (producto.ingredients || []).length > 3 &&
            h('span', { className: 'ingredienteMas' }, `+${(producto.ingredients || []).length - 3} más`)
        )
      )
    ),
    h('div', { className: 'pie' },
      h('span', { className: 'precio' }, `$${producto.price}`),
      h('button', {
        className: 'botonAgregar',
        disabled: !disponible,
        onClick: () => navegar(`/producto/${producto._id || producto.id}`),
      }, disponible ? 'Ver detalles' : 'No disponible')
    )
  );
}
