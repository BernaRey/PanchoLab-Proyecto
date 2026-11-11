import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import FiltroCategoria from '../components/FiltroCategoria.jsx';
import CuadriculaProductos from '../components/CuadriculaProductos.jsx';
import { productos as apiProductos, contacto as apiContacto } from '../services/api.js';
import { desplazarASeccion } from '../utilidades/desplazarASeccion.js';

export default function Home({
  usuario,
  navegar,
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
    if (!nodo) return undefined;
    const momentos = [...nodo.querySelectorAll('[data-hero-momento]')];
    if (reducido) {
      nodo.dataset.movimiento = 'reducido';
      nodo.style.setProperty('--hero-pan', '1');
      nodo.style.setProperty('--hero-salchicha', '1');
      nodo.style.setProperty('--hero-salsas', '1');
      nodo.style.setProperty('--hero-ensamble-opacidad', '1');
      nodo.style.setProperty('--hero-cierre-opacidad', '1');
      nodo.style.setProperty('--hero-cierre-y', '0px');
      momentos.forEach((momento) => momento.setAttribute('aria-hidden', 'false'));
      return undefined;
    }

    let frame = 0;
    function actualizarProgreso() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = nodo.getBoundingClientRect();
        const recorrido = nodo.offsetHeight - window.innerHeight;
        const recorridoActual = Math.max(0, Math.min(recorrido, -rect.top));
        const progreso = recorrido > 0 ? recorridoActual / recorrido : 0;
        const limitar = (valor) => Math.max(0, Math.min(1, valor));
        const pan = limitar(progreso / 0.16);
        const salchicha = limitar((progreso - 0.16) / 0.19);
        const salsas = limitar((progreso - 0.35) / 0.2);
        const salida = limitar((progreso - 0.76) / 0.14);
        const opacidadTitular = 1 - limitar((progreso - 0.72) / 0.14);
        const opacidadCierre = limitar((progreso - 0.73) / 0.11);
        nodo.style.setProperty('--hero-pan', pan.toFixed(3));
        nodo.style.setProperty('--hero-salchicha', salchicha.toFixed(3));
        nodo.style.setProperty('--hero-salsas', salsas.toFixed(3));
        nodo.style.setProperty('--hero-pan-y', `${(1 - pan) * -52}px`);
        nodo.style.setProperty('--hero-base-y', `${(1 - pan) * 42}px`);
        nodo.style.setProperty('--hero-salchicha-y', `${(1 - salchicha) * 36}px`);
        nodo.style.setProperty('--hero-salsas-y', `${(1 - salsas) * 24}px`);
        nodo.style.setProperty('--hero-ensamble-opacidad', (1 - salida).toFixed(3));
        nodo.style.setProperty('--hero-titular-opacidad', opacidadTitular.toFixed(3));
        nodo.style.setProperty('--hero-cierre-opacidad', opacidadCierre.toFixed(3));
        nodo.style.setProperty('--hero-cierre-y', `${(1 - opacidadCierre) * 16}px`);
        nodo.style.setProperty('--progreso-hero', progreso.toFixed(4));
        nodo.style.setProperty('--hero-x', `${-8 + salida * 62}%`);
        nodo.style.setProperty('--hero-y', `${-8 - salida * 12}px`);
        nodo.style.setProperty('--hero-scale', `${1.03 - salida * 0.08}`);
        nodo.querySelector('.hero-progreso i')?.style.setProperty('transform', `scaleX(${progreso})`);
        momentos.forEach((momento, indice) => {
          const visibilidad = limitar((progreso - (0.82 + indice * 0.025)) / 0.1);
          momento.style.opacity = visibilidad.toFixed(2);
          momento.style.transform = `translateY(${(1 - visibilidad) * 12}px)`;
          momento.setAttribute('aria-hidden', visibilidad < 0.5 ? 'true' : 'false');
        });
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
        desplazarASeccion('productos');
      });
    }
  }, []);

  function explorarCatalogo(evento) {
    evento.preventDefault();
    desplazarASeccion('productos');
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
            <div className="hero-columna hero-columna-izquierda" aria-hidden="true">RECETAS / CULTURAS / SABORES</div>
            <div className="hero-codigo" aria-hidden="true"><span>PL—ARCHIVO</span><span>COLONIA · URUGUAY</span></div>
            <div className="hero-orbita hero-orbita-uno" aria-hidden="true" />
            <div className="hero-orbita hero-orbita-dos" aria-hidden="true" />
            <div className="hero-producto" aria-hidden="true">
              <div className="hero-etiqueta-producto">ARMADO EN TRES PASOS <span>PL—01</span></div>
              <svg className="hero-ilustracion" viewBox="0 0 900 500" role="img" aria-label="Un pancho se arma por capas: pan, salchicha y aderezos">
                <defs>
                  <linearGradient id="pan-tostado" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0" stopColor="#ffd58a" /><stop offset=".56" stopColor="#d9873d" /><stop offset="1" stopColor="#9d4827" /></linearGradient>
                  <linearGradient id="salchicha-brasa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0825c" /><stop offset=".5" stopColor="#b53e31" /><stop offset="1" stopColor="#71241f" /></linearGradient>
                  <linearGradient id="plato-lab" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f2d6a4" stopOpacity=".45" /><stop offset="1" stopColor="#f2d6a4" stopOpacity=".03" /></linearGradient>
                  <filter id="sombra-pancho" x="-25%" y="-40%" width="150%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="15" /><feOffset dy="18" /><feComponentTransfer><feFuncA type="linear" slope=".42" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <ellipse cx="450" cy="386" rx="355" ry="57" fill="url(#plato-lab)" stroke="#f1d5a3" strokeOpacity=".26" strokeWidth="2" />
                <g className="hero-capa hero-capa-pan" filter="url(#sombra-pancho)">
                  <path className="hero-pan-base" d="M113 268 C123 228 164 210 219 218 L261 241 C348 254 549 254 639 241 L682 218 C740 208 783 229 792 268 L770 321 C742 357 689 374 625 378 L278 378 C211 374 160 357 133 322Z" fill="url(#pan-tostado)" stroke="#ffdfa0" strokeOpacity=".68" strokeWidth="5" />
                  <path className="hero-pan-superior" d="M151 258 C163 227 191 216 224 222 L274 246 C356 259 543 259 625 246 L676 222 C710 216 740 228 753 258 C711 275 665 288 620 291 L281 291 C233 287 188 276 151 258Z" fill="#f3c47b" fillOpacity=".82" stroke="#ffe0a4" strokeOpacity=".74" strokeWidth="4" />
                  <path d="M186 263 C286 284 603 285 716 261" fill="none" stroke="#fff0c8" strokeOpacity=".56" strokeWidth="7" strokeLinecap="round" />
                  <path d="M183 324 C295 350 581 350 713 322" fill="none" stroke="#894323" strokeOpacity=".58" strokeWidth="9" strokeLinecap="round" />
                </g>
                <g className="hero-capa hero-capa-salchicha" filter="url(#sombra-pancho)">
                  <path d="M145 247 C152 205 192 182 248 182 L663 182 C718 182 754 208 760 246 C766 281 734 300 683 300 L222 300 C170 300 139 279 145 247Z" fill="url(#salchicha-brasa)" stroke="#ffad7b" strokeOpacity=".7" strokeWidth="4" />
                  <path d="M193 220 C271 201 385 198 501 202" fill="none" stroke="#ffd2a4" strokeOpacity=".44" strokeWidth="8" strokeLinecap="round" />
                  <path d="M222 284 C338 294 550 294 686 277" fill="none" stroke="#4d1b1c" strokeOpacity=".38" strokeWidth="7" strokeLinecap="round" />
                </g>
                <g className="hero-capa hero-capa-salsas" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M204 231 C260 198 292 258 352 229 S448 205 496 234 S592 261 696 217" stroke="#f5c14c" strokeWidth="17" />
                  <path d="M235 258 C298 235 327 278 393 251 S518 230 558 255 S636 271 690 250" stroke="#e34d39" strokeWidth="10" />
                  <circle cx="285" cy="218" r="5" fill="#fff0ca" stroke="none"/><circle cx="630" cy="226" r="5" fill="#fff0ca" stroke="none"/>
                </g>
              </svg>
              <span className="hero-sello">CULTURA<br />COMESTIBLE</span>
            </div>
            <div className="hero-contenido">
              <p className="sobretitulo"><span className="punto-vivo" /> LABORATORIO DE SABORES · DESDE COLONIA</p>
              <h1><span>EL MUNDO</span><span className="hero-linea-dos">ENTRE <i>DOS</i></span><span>PANES.</span></h1>
              <p className="hero-bajada">Investigamos culturas. Mezclamos ingredientes.<br />Servimos historias que se comen.</p>
              <a href="#productos" className="boton boton-primario hero-cta" onClick={explorarCatalogo}>Explorar el menú <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-relatos" aria-label="El recorrido de PanchoLab">
              <p className="hero-momento" data-hero-momento="0"><span>01 · ORIGEN</span><strong>Cada cultura trae su manera de celebrar.</strong></p>
              <p className="hero-momento" data-hero-momento="1"><span>02 · MEZCLA</span><strong>Ingredientes de acá, ideas de todas partes.</strong></p>
              <p className="hero-momento" data-hero-momento="2"><span>03 · DESTINO</span><strong>Una historia nueva, lista para llegar a donde estés.</strong></p>
            </div>
            <div className="hero-cierre-marca" role="img" aria-label="Logo de PanchoLab: un pancho y un matraz de laboratorio con espuma">
              <svg viewBox="0 0 420 300" aria-hidden="true">
                <defs>
                  <linearGradient id="marca-pan" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffd990"/><stop offset="1" stopColor="#b96235"/></linearGradient>
                  <linearGradient id="marca-salchicha" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f48a60"/><stop offset="1" stopColor="#9c3029"/></linearGradient>
                  <linearGradient id="marca-brebaje" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#efb34e" stopOpacity=".92"/><stop offset="1" stopColor="#df4c32" stopOpacity=".95"/></linearGradient>
                </defs>
                <g className="marca-matraz">
                  <path d="M288 73 L331 73 L331 112 L374 212 Q383 237 357 245 L267 245 Q242 237 253 212 L288 112Z" fill="#151310" fillOpacity=".7" stroke="#f1d4a0" strokeWidth="4" strokeLinejoin="round"/>
                  <path d="M268 207 Q310 191 360 207 L376 224 Q379 239 356 242 L267 242 Q246 237 253 220Z" fill="url(#marca-brebaje)"/>
                  <path d="M268 207 Q310 191 360 207" fill="none" stroke="#ffe49f" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M283 82 L336 82" stroke="#f1d4a0" strokeWidth="5" strokeLinecap="round"/>
                  <path d="M280 226 Q307 218 335 227" fill="none" stroke="#fff0c8" strokeOpacity=".58" strokeWidth="4" strokeLinecap="round"/>
                </g>
                <g className="marca-espuma" fill="#fff0c8" stroke="#f1d4a0" strokeWidth="2">
                  <circle cx="291" cy="69" r="10"/><circle cx="310" cy="62" r="14"/><circle cx="332" cy="70" r="10"/>
                </g>
                <g className="marca-burbujas" fill="#f6d787" stroke="#fff0c8" strokeWidth="2">
                  <circle className="burbuja burbuja-uno" cx="279" cy="180" r="7"/>
                  <circle className="burbuja burbuja-dos" cx="328" cy="168" r="5"/>
                  <circle className="burbuja burbuja-tres" cx="354" cy="181" r="8"/>
                  <circle className="burbuja burbuja-cuatro" cx="302" cy="145" r="4"/>
                  <circle className="burbuja burbuja-cinco" cx="347" cy="133" r="5"/>
                  <circle className="burbuja burbuja-alta burbuja-seis" cx="298" cy="43" r="5"/>
                  <circle className="burbuja burbuja-alta burbuja-siete" cx="336" cy="34" r="4"/>
                  <circle className="burbuja burbuja-alta burbuja-ocho" cx="358" cy="53" r="6"/>
                </g>
                <g className="marca-pancho">
                  <path d="M41 205 Q48 166 80 157 Q119 144 173 155 L218 168 Q242 178 239 205 L222 232 Q198 245 84 242 Q46 238 41 205Z" fill="url(#marca-pan)" stroke="#ffe2a9" strokeWidth="4"/>
                  <path d="M54 198 Q72 169 105 168 L202 177 Q226 183 228 203 Q206 219 83 221 Q58 219 54 198Z" fill="url(#marca-salchicha)" stroke="#ffb37e" strokeWidth="3"/>
                  <path d="M75 192 Q103 174 125 194 Q147 212 172 189 Q195 171 216 194" fill="none" stroke="#f4c557" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M72 226 Q135 236 210 220" fill="none" stroke="#8c4828" strokeOpacity=".6" strokeWidth="5" strokeLinecap="round"/>
                  <circle cx="94" cy="177" r="3" fill="#fff0c8"/><circle cx="148" cy="177" r="3" fill="#fff0c8"/><circle cx="193" cy="184" r="3" fill="#fff0c8"/>
                </g>
                <path className="marca-brillo" d="M228 108 L233 122 L247 127 L233 132 L228 146 L223 132 L209 127 L223 122Z" fill="#efc37f"/>
                <circle className="marca-destello" cx="388" cy="114" r="4" fill="#f4eee4"/>
              </svg>
              <span><strong>PANCHOLAB</strong><small>LABORATORIO DE SABORES</small></span>
            </div>
            <div className="hero-pie">
              <span>SEGUÍ BAJANDO</span>
              <span className="hero-progreso"><i /></span>
              <span>01 — 03</span>
            </div>
          </div>
        </section>

        <div className="cinta-manifiesto" aria-label="Panchos culturales, ciencia del sabor, ingredientes reales y recetas con pasaporte">
          <div className="cinta-pista">
            <div className="cinta-grupo">
              <span>PANCHOS CULTURALES</span><b>✳</b><span>CIENCIA DEL SABOR</span><b>✳</b><span>INGREDIENTES REALES</span><b>✳</b><span>RECETAS CON PASAPORTE</span><b>✳</b>
            </div>
            <div className="cinta-grupo" aria-hidden="true">
              <span>PANCHOS CULTURALES</span><b>✳</b><span>CIENCIA DEL SABOR</span><b>✳</b><span>INGREDIENTES REALES</span><b>✳</b><span>RECETAS CON PASAPORTE</span><b>✳</b>
            </div>
          </div>
        </div>

        <section id="productos" className="catalogo seccion seccion-oscura">
          <div className="seccion-contenedor">
            <header className="encabezado-catalogo encabezado-editorial">
              <div className="catalogo-indice"><span>ARCHIVO DE SABORES</span><span>RECETAS · COLONIA</span></div>
              <p className="sobretitulo">RECETAS CON PASAPORTE</p>
              <h2>La carta de<br /><i>experimentación.</i></h2>
              <p>Un viaje de frontera en frontera. Cada receta toma una cultura como punto de partida y llega a tu casa en forma de pancho.</p>
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
          <div className="manifiesto-lateral"><span>NOTAS DE LABORATORIO</span><span>COLONIA DEL SACRAMENTO · URUGUAY</span></div>
          <div className="manifiesto-contenido">
            <p className="sobretitulo">NO HACEMOS PANCHOS. PREPARAMOS VIAJES.</p>
            <h2>Del laboratorio<br /><i>a tu puerta.</i></h2>
            <p>PanchoLab nace de una idea simple: un sabor también puede contar de dónde viene mientras viaja hacia tu casa. Investigamos recetas, escuchamos sus historias y las reinterpretamos con ingredientes cercanos, curiosidad y respeto, listas para disfrutar donde estés.</p>
            <a href="#contacto" className="enlace-editorial">Hablemos de sabores <span aria-hidden="true">↘</span></a>
          </div>
          <div className="manifiesto-nota" aria-hidden="true"><span>LABORATORIO DE SABORES</span><strong>PL</strong><span>COLONIA, URUGUAY</span></div>
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
    </div>
  );
}
