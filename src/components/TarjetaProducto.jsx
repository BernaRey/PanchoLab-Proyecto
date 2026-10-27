import React, { useState } from 'react';
import { formatearPrecio } from '../utilidades/formatearPrecio.js';

export default function TarjetaProducto({
  producto,
  navegar,
  alAgregarProducto,
  tiendaAbierta,
  cargandoTienda,
}) {
  const [aviso, setAviso] = useState('');
  const [errorAgregar, setErrorAgregar] = useState(false);
  const identificador = producto._id || producto.id;
  const stock = Math.max(0, Math.floor(Number(producto.stock) || 0));
  const disponible = stock > 0 && producto.isActive !== false;
  const puedeAgregar = disponible && tiendaAbierta && !cargandoTienda;

  function agregarAlCarrito() {
    const resultado = alAgregarProducto(producto);
    setAviso(resultado.mensaje);
    setErrorAgregar(!resultado.exito);
  }

  return (
    <article className="tarjeta-catalogo">
      <div className="imagen-catalogo">
        {producto.image ? (
          <img
            src={producto.image}
            alt={producto.name}
            loading="lazy"
            onError={(evento) => {
              evento.currentTarget.hidden = true;
            }}
          />
        ) : (
          <span className="imagen-sin-foto">Pancholab</span>
        )}
        <span className={`etiqueta-stock ${disponible ? '' : 'etiqueta-sin-stock'}`}>
          {disponible ? `${stock} disponibles` : 'Sin stock'}
        </span>
      </div>

      <div className="contenido-catalogo">
        {producto.country && <p className="pais-catalogo">{producto.country}</p>}
        <h3>{producto.name}</h3>
        <p className="descripcion-catalogo">{producto.description}</p>

        {Array.isArray(producto.ingredients) && producto.ingredients.length > 0 && (
          <ul className="ingredientes-catalogo" aria-label="Ingredientes principales">
            {producto.ingredients.slice(0, 3).map((ingrediente) => (
              <li key={ingrediente}>{ingrediente}</li>
            ))}
          </ul>
        )}

        <div className="pie-catalogo">
          <span className="precio-catalogo">{formatearPrecio(producto.price)}</span>
          <button
            type="button"
            className={`boton-producto ${puedeAgregar ? '' : 'boton-producto-agotado'}`}
            disabled={!puedeAgregar}
            onClick={puedeAgregar ? agregarAlCarrito : undefined}
          >
            {cargandoTienda
              ? 'Verificando tienda...'
              : !tiendaAbierta
                ? 'TIENDA CERRADA'
                : disponible
                  ? 'Agregar al carrito'
                  : 'SIN STOCK'}
          </button>
        </div>
        {aviso && (
          <p
            className={errorAgregar ? 'aviso-carrito aviso-carrito-error' : 'aviso-carrito'}
            role={errorAgregar ? 'alert' : 'status'}
          >
            {aviso}
          </p>
        )}
        <button
          type="button"
          className="enlace-detalle-producto"
          onClick={() => navegar(`/producto/${identificador}`)}
        >
          Ver detalles
        </button>
      </div>
    </article>
  );
}
