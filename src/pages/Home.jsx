import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import FiltroCategoria from '../components/FiltroCategoria.jsx';
import CuadriculaProductos from '../components/CuadriculaProductos.jsx';
import AsistenteSabores from '../components/AsistenteSabores.jsx';
import { productos as apiProductos, contacto as apiContacto } from '../services/api.js';

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
  const [contacto, setContacto] = useState({ nombre: '', correo: '', mensaje: '' });
  const [enviandoContacto, setEnviandoContacto] = useState(false);
  const [estadoContacto, setEstadoContacto] = useState(null);
  const heroRef = useRef(null);

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
        if (componenteActivo) setError(errorCarga.message || 'No se pudieron cargar los productos.');
      } finally {
        if (componenteActivo) setCargando(false);
      }
    }

    void cargarProductos();
    return () => { componenteActivo = false; };
  }, [categoriaActiva, numeroActualizacion]);

  useEffect(() => {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodo = heroRef.current;
    if (!nodo || reducido) return undefined;

    let frame = 0;
    function actualizarProgreso() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = nodo.getBoundingClientRect();
        const recorrido = nodo.offsetHeight - window.innerHeight;
        const recorridoActual = Math.max(0, Math.min(recorrido, -rect.top));
        const progreso = recorrido > 0 ? recorridoActual / recorrido : 0;
        nodo.style.setProperty('--progreso-hero', progreso.toFixed(4));
        nodo.style.setProperty('--hero-x', `${27 * (1 - progreso)}%`);
        nodo.style.setProperty('--hero-y', `${-12 * (1 - progreso)}px`);
        nodo.style.setProperty('--hero-scale', `${1.23 - 0.23 * progreso}`);
        nodo.querySelector('.hero-progreso i')?.style.setProperty('transform', `scaleX(${progreso})`);
      });
    }

    actualizarProgreso();
    window.addEventListener('scroll', actualizarProgreso, { passive: true });
    window.addEventListener('resize', actualizarProgreso);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', actualizarProgreso);
      window.removeEventListener('resize', actualizarProgreso);
    };
  }, []);

  useEffect(() => {
    if (window.location.pathname === '/productos' || window.location.hash === '#/productos') {
      window.requestAnimationFrame(() => {
        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  function explorarCatalogo(evento) {
    evento.preventDefault();
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function enviarContacto(evento) {
    evento.preventDefault();
    setEnviandoContacto(true);
    setEstadoContacto(null);
    try {
      const respuesta = await apiContacto.prepararWhatsApp(contacto);
      window.location.assign(respuesta.url);
      setEstadoContacto({ tipo: 'ok', texto: 'Abriendo WhatsApp para que envíes tu mensaje.' });
    } catch (errorContacto) {
      setEstadoContacto({ tipo: 'error', texto: errorContacto.message || 'No se pudo preparar el mensaje.' });
    } finally {
      setEnviandoContacto(false);
    }
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
        <section id="inicio" className="hero-recorrido" ref={heroRef} aria-label="Presentación de PanchoLab">
          <div className="hero-fijo">
            <div className="hero-fondo" aria-hidden="true" />
            <div className="hero-grano" aria-hidden="true" />
            <div className="hero-columna hero-columna-izquierda" aria-hidden="true">CALLE / CULTURA / FUEGO</div>
            <div className="hero-codigo" aria-hidden="true"><span>PL—001</span><span>MONTEVIDEO · UY</span></div>
            <div className="hero-orbita hero-orbita-uno" aria-hidden="true" />
            <div className="hero-orbita hero-orbita-dos" aria-hidden="true" />
            <div className="hero-producto" aria-hidden="true">
              <div className="hero-etiqueta-producto">PROTOCOLO DE SABOR <span>01 / 04</span></div>
              <img
                src="https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=1500&q=88"
                alt=""
                fetchPriority="high"
              />
              <span className="hero-sello">FUEGO<br />LENTO</span>
            </div>
            <div className="hero-contenido">
              <p className="sobretitulo"><span className="punto-vivo" /> LABORATORIO DE SABORES · DESDE COLONIA</p>
              <h1><span>EL MUNDO</span><span className="hero-linea-dos">ENTRE <i>DOS</i></span><span>PANES.</span></h1>
              <p className="hero-bajada">Investigamos culturas. Mezclamos ingredientes.<br />Servimos historias que se comen.</p>
              <a href="#productos" className="boton boton-primario hero-cta" onClick={explorarCatalogo}>Explorar el menú <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-pie">
              <span>DESLIZÁ PARA DESCUBRIR</span>
              <span className="hero-progreso"><i /></span>
              <span>01 — 04</span>
            </div>
          </div>
        </section>

        <div className="cinta-manifiesto" aria-label="Panchos culturales, ciencia del sabor, ingredientes reales">
          <div className="cinta-pista"><span>PANCHOS CULTURALES</span><b>✳</b><span>CIENCIA DEL SABOR</span><b>✳</b><span>INGREDIENTES REALES</span><b>✳</b><span>PANCHOS CULTURALES</span><b>✳</b></div>
        </div>

        <section id="productos" className="catalogo seccion seccion-oscura">
          <div className="seccion-contenedor">
            <header className="encabezado-catalogo encabezado-editorial">
              <div className="catalogo-indice"><span>ARCHIVO DE SABORES</span><span>VOL. 01 / 2026</span></div>
              <p className="sobretitulo">RECETAS CON PASAPORTE</p>
              <h2>La carta de<br /><i>experimentación.</i></h2>
              <p>Un viaje de frontera en frontera. Cada receta toma una cultura como punto de partida y la trae a nuestra mesa.</p>
            </header>

            <FiltroCategoria categoriaActiva={categoriaActiva} onCambiarCategoria={setCategoriaActiva} />
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

        <section className="manifiesto seccion" id="laboratorio">
          <div className="manifiesto-lateral"><span>NOTAS DE LABORATORIO</span><span>45°32′S — 69°12′W</span></div>
          <div className="manifiesto-contenido">
            <p className="sobretitulo">NO HACEMOS PANCHOS. HACEMOS LUGAR.</p>
            <h2>Una mesa.<br /><i>Mil lugares.</i></h2>
            <p>PanchoLab nace de una idea simple: la comida también puede contar de dónde venimos y hacia dónde viajamos. Investigamos recetas, escuchamos sus historias y las reinterpretamos con ingredientes cercanos, curiosidad y respeto.</p>
            <a href="#contacto" className="enlace-editorial">Conocé el laboratorio <span aria-hidden="true">↘</span></a>
          </div>
          <div className="manifiesto-nota" aria-hidden="true"><span>EST. 2024</span><strong>PL</strong><span>COLONIA, UY</span></div>
        </section>

        <section className="contacto-seccion seccion" id="contacto">
          <div className="contacto-intro">
            <p className="sobretitulo">NOS GUSTA CONVERSAR</p>
            <h2>¿Qué sabor<br />te <i>trajo acá?</i></h2>
            <p>¿Una idea, una pregunta o una receta para investigar? Contanos. El mensaje se abrirá en WhatsApp para que puedas enviarlo directamente.</p>
            <span className="contacto-coordenadas">PANCHO LAB · COLONIA, URUGUAY</span>
          </div>
          <form className="formulario-contacto" onSubmit={enviarContacto}>
            <label htmlFor="contacto-nombre">Tu nombre</label>
            <input id="contacto-nombre" name="nombre" autoComplete="name" maxLength={80} required value={contacto.nombre} onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })} placeholder="¿Cómo te llamás?" />
            <label htmlFor="contacto-correo">Tu correo</label>
            <input id="contacto-correo" name="correo" type="email" autoComplete="email" maxLength={120} required value={contacto.correo} onChange={(e) => setContacto({ ...contacto, correo: e.target.value })} placeholder="nombre@correo.com" />
            <label htmlFor="contacto-mensaje">Tu mensaje</label>
            <textarea id="contacto-mensaje" name="mensaje" rows="4" maxLength={700} required value={contacto.mensaje} onChange={(e) => setContacto({ ...contacto, mensaje: e.target.value })} placeholder="Estamos escuchando..." />
            {estadoContacto && <p className={`formulario-estado ${estadoContacto.tipo}`} role={estadoContacto.tipo === 'error' ? 'alert' : 'status'}>{estadoContacto.texto}</p>}
            <button className="boton boton-primario boton-contacto" type="submit" disabled={enviandoContacto}>{enviandoContacto ? 'Preparando mensaje…' : 'Escribir por WhatsApp'} <span aria-hidden="true">↗</span></button>
          </form>
        </section>
      </main>

      <Footer navegar={navegar} />
      <AsistenteSabores productos={productos} />
    </div>
  );
}
