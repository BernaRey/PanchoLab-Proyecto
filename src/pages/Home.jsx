import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.js';
import FiltroCategoria from '../components/FiltroCategoria.jsx';
import CuadriculaProductos from '../components/CuadriculaProductos.jsx';
import { productos as apiProductos } from '../services/api.js';

export default function Home({
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
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [numeroActualizacion, setNumeroActualizacion] = useState(0);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarProductos() {
      setCargando(true);
      setError('');

      try {
        const respuesta = await apiProductos.listar(categoriaActiva, true);
        if (!Array.isArray(respuesta.datos)) {
          throw new Error('La respuesta del catálogo no tiene el formato esperado.');
        }
        if (componenteActivo) setProductos(respuesta.datos);
      } catch (errorCarga) {
        if (componenteActivo) {
          setError(errorCarga.message || 'No se pudieron cargar los productos.');
        }
      } finally {
        if (componenteActivo) setCargando(false);
      }
    }

    void cargarProductos();

    return () => {
      componenteActivo = false;
    };
  }, [categoriaActiva, numeroActualizacion]);

  useEffect(() => {
    if (window.location.pathname === '/productos') {
      window.requestAnimationFrame(() => {
        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  function explorarCatalogo(evento) {
    evento.preventDefault();
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="pagina">
      <Navbar
        usuario={usuario}
        navegar={navegar}
        tema={tema}
        alCambiarTema={alCambiarTema}
        cantidadCarrito={cantidadCarrito}
        alAbrirCarrito={alAbrirCarrito}
        tiendaAbierta={tiendaAbierta}
        cargandoTienda={cargandoTienda}
      />

      <main>
        <section id="inicio" className="hero">
          <div
            className="fondoHero"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1920&q=80)',
            }}
          />
          <div className="fondoRejilla" />
          <div className="overlayHero" />
          <div className="contenido">
            <div className="etiqueta">
              <span className="etiquetaIcono" aria-hidden="true">🧪</span>
              <span>Laboratorio gastronómico</span>
            </div>
            <h1 className="hero-titulo">
              <span>PANCHOLAB</span>
              <br />
              <span className="hero-subtitulo">Sabores del mundo</span>
            </h1>
            <p className="hero-descripcion">
              Panchos inspirados en las mejores cocinas del mundo, preparados
              con técnica de laboratorio y pasión por el sabor.
            </p>
            <div className="acciones">
              <a
                href="/productos"
                className="boton boton-primario"
                onClick={explorarCatalogo}
              >
                Explorar el menú
              </a>
            </div>
          </div>
        </section>

        <section id="productos" className="catalogo seccion seccion-oscura">
          <div className="seccion-contenedor">
            <header className="encabezado-catalogo">
              <div className="etiqueta">Recién salidos del laboratorio</div>
              <h2>Nuestro catálogo</h2>
              <p>Elegí tu próximo viaje de sabor.</p>
            </header>

            <FiltroCategoria
              categoriaActiva={categoriaActiva}
              onCambiarCategoria={setCategoriaActiva}
            />

            <CuadriculaProductos
              productos={productos}
              cargando={cargando}
              error={error}
              usuario={usuario}
              navegar={navegar}
              alAgregarProducto={alAgregarProducto}
              tiendaAbierta={tiendaAbierta}
              cargandoTienda={cargandoTienda}
              onReintentar={() => setNumeroActualizacion((actual) => actual + 1)}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
