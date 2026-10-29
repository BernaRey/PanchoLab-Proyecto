import React, { useEffect, useState } from 'react';
import { productos as apiProductos } from '../services/api.js';
import { formatearPrecio } from '../utilidades/formatearPrecio.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function ProductoDetalle({
  id,
  usuario,
  navegar,
  tema,
  alCambiarTema,
  cantidadCarrito,
  alAbrirCarrito,
  alAgregarProducto,
  tiendaAbierta,
  cargandoTienda,
}) {
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [errorCarrito, setErrorCarrito] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const respuesta = await apiProductos.obtener(id);
        if (activo) setProducto(respuesta.datos || respuesta);
      } catch (errorCarga) {
        if (activo) setError(errorCarga.message || 'No se pudo cargar esta receta.');
      } finally {
        if (activo) setCargando(false);
      }
    }
    void cargar();
    return () => { activo = false; };
  }, [id]);

  function agregarAlCarrito() {
    const resultado = alAgregarProducto(producto);
    setAviso(resultado.mensaje);
    setErrorCarrito(!resultado.exito);
  }

  const stock = Math.max(0, Math.floor(Number(producto?.stock) || 0));
  const disponible = Boolean(producto) && stock > 0 && producto.isActive !== false;
  const puedeAgregar = disponible && tiendaAbierta && !cargandoTienda;

  return (
    <div className="pagina">
      <Navbar usuario={usuario} navegar={navegar} tema={tema} alCambiarTema={alCambiarTema} cantidadCarrito={cantidadCarrito} alAbrirCarrito={alAbrirCarrito} tiendaAbierta={tiendaAbierta} cargandoTienda={cargandoTienda} />
      <main className="producto-pagina">
        {cargando ? (
          <div className="estado" role="status"><span className="icono-estado">✳</span><p>Abriendo el cuaderno de recetas…</p></div>
        ) : error || !producto ? (
          <div className="estado mensajeError" role="alert"><h1>Receta no encontrada</h1><p>{error || 'El producto solicitado no existe.'}</p><button type="button" className="boton boton-primario" onClick={() => navegar('/')}>Volver a la carta</button></div>
        ) : (
          <article className="producto-detalle">
            <div className="detalle-imagen">
              {producto.image ? <img src={producto.image} alt={producto.name} /> : <div className="detalle-imagen-vacia">PanchoLab<br /><i>Archivo de sabores</i></div>}
              <span className="detalle-indice">FICHA DE RECETA · {producto.country || 'ORIGEN ABIERTO'}</span>
            </div>
            <div className="detalle-contenido">
              <button type="button" className="detalle-volver" onClick={() => navegar('/productos')}>← Volver a la carta</button>
              <p className="sobretitulo">{producto.country || 'RECETA PANCHOLAB'} · {producto.category || 'PANCHOS'}</p>
              <h1>{producto.name}</h1>
              <p className="detalle-descripcion">{producto.description}</p>
              <div className="detalle-precio"><strong>{formatearPrecio(producto.price)}</strong><span>{disponible ? `${stock} porciones disponibles` : 'No disponible ahora'}</span></div>
              <section className="detalle-ingredientes">
                <h2>Composición</h2>
                {Array.isArray(producto.ingredients) && producto.ingredients.length ? (
                  <ul>{producto.ingredients.map((ingrediente, indice) => <li key={`${ingrediente}-${indice}`}>{ingrediente}</li>)}</ul>
                ) : <p>Esta ficha todavía no tiene ingredientes publicados.</p>}
              </section>
              <button type="button" className="boton boton-primario detalle-agregar" disabled={!puedeAgregar} onClick={agregarAlCarrito}>
                {cargandoTienda ? 'Consultando tienda…' : !tiendaAbierta ? 'Tienda cerrada' : disponible ? 'Agregar al carrito' : 'Sin stock'}
              </button>
              {aviso && <p className={errorCarrito ? 'aviso-carrito aviso-carrito-error' : 'aviso-carrito'} role={errorCarrito ? 'alert' : 'status'}>{aviso}</p>}
            </div>
          </article>
        )}
      </main>
      <Footer navegar={navegar} />
    </div>
  );
}
