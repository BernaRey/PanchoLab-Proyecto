import React from 'react';

const categorias = [
  { id: null, nombre: 'Todos', icono: '🧪' },
  { id: 'panchos', nombre: 'Panchos', icono: '🌭' },
  { id: 'bebidas', nombre: 'Bebidas', icono: '🥤' },
];

export default function FiltroCategoria({ categoriaActiva, onCambiarCategoria }) {
  return (
    <div className="filtros-catalogo" aria-label="Filtrar productos por categoría">
      {categorias.map((categoria) => (
        <button
          key={categoria.id || 'todos'}
          type="button"
          className={`boton-filtro ${
            categoriaActiva === categoria.id ? 'boton-filtro-activo' : ''
          }`}
          aria-pressed={categoriaActiva === categoria.id}
          onClick={() => onCambiarCategoria(categoria.id)}
        >
          <span aria-hidden="true">{categoria.icono}</span>
          {categoria.nombre}
        </button>
      ))}
    </div>
  );
}
