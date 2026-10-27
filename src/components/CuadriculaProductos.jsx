import React from 'react';
import TarjetaProducto from './TarjetaProducto.jsx';

export default function CuadriculaProductos({
  productos,
  cargando,
  error,
  navegar,
  alAgregarProducto,
  tiendaAbierta,
  cargandoTienda,
  onReintentar,
}) {
  if (cargando) {
    return (
      <div className="estado-catalogo" role="status">
        <span className="icono-estado" aria-hidden="true">🔬</span>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="estado-catalogo estado-catalogo-error" role="alert">
        <span className="icono-estado" aria-hidden="true">⚠</span>
        <p>{error}</p>
        <button type="button" className="boton-reintentar" onClick={onReintentar}>
          Reintentar
        </button>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="estado-catalogo">
        <span className="icono-estado" aria-hidden="true">🌭</span>
        <p>No hay productos disponibles en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="cuadricula-catalogo">
      {productos.map((producto) => (
        <TarjetaProducto
          key={producto._id || producto.id}
          producto={producto}
          navegar={navegar}
          alAgregarProducto={alAgregarProducto}
          tiendaAbierta={tiendaAbierta}
          cargandoTienda={cargandoTienda}
        />
      ))}
    </div>
  );
}
