import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const modeloSketchfab = 'https://sketchfab.com/models/c3901ba87a354945b9ce221e35f4721e';

export default function PaginaNoEncontrada({
  usuario,
  navegar,
  cantidadCarrito,
  alAbrirCarrito,
  tiendaAbierta,
  cargandoTienda,
  errorTienda,
}) {
  const [movimientoReducido, setMovimientoReducido] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const actualizarPreferencia = (evento) => setMovimientoReducido(evento.matches);
    preferencia.addEventListener('change', actualizarPreferencia);
    return () => preferencia.removeEventListener('change', actualizarPreferencia);
  }, []);

  const velocidadGiro = movimientoReducido ? 0 : 0.35;
  const urlVisor = `${modeloSketchfab}/embed?autostart=1&autospin=${velocidadGiro}&dnt=1`;

  return (
    <div className="pagina pagina-no-encontrada">
      <Navbar
        usuario={usuario}
        navegar={navegar}
        cantidadCarrito={cantidadCarrito}
        alAbrirCarrito={alAbrirCarrito}
        tiendaAbierta={tiendaAbierta}
        cargandoTienda={cargandoTienda}
        errorTienda={errorTienda}
      />

      <main className="no-encontrada-main">
        <section className="no-encontrada-contenido" aria-labelledby="titulo-no-encontrada">
          <div className="no-encontrada-texto">
            <p className="sobretitulo"><span className="punto-vivo" /> ARCHIVO FUERA DE CARTA</p>
            <span className="no-encontrada-codigo">ERROR 404 · RECETA NO LOCALIZADA</span>
            <h1 id="titulo-no-encontrada">Este camino<br />no lleva al <i>menú.</i></h1>
            <p className="no-encontrada-descripcion">La página que buscás no existe o cambió de dirección. El pancho, por suerte, sigue girando.</p>
            <button className="boton boton-primario" type="button" onClick={() => navegar('/')}>
              Volver al inicio <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="no-encontrada-visor-contenedor">
            <div className="no-encontrada-visor-marco">
              <iframe
                className="no-encontrada-visor"
                title="Hotdog low-poly en 3D, girando lentamente"
                src={urlVisor}
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                loading="eager"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="no-encontrada-creditos">
              Modelo 3D:{' '}
              <a href={modeloSketchfab} target="_blank" rel="noopener noreferrer nofollow">Low-poly hotdog</a>
              {' '}por{' '}
              <a href="https://sketchfab.com/salvation188" target="_blank" rel="noopener noreferrer nofollow">TenderMeatPopsicle</a>
              {' '}en{' '}
              <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer nofollow">Sketchfab</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer navegar={navegar} />
    </div>
  );
}
