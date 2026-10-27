import { useEffect, useState } from 'react';

export default function Navbar({
  usuario,
  navegar,
  tema = 'oscuro',
  alCambiarTema = () => {},
  cantidadCarrito = 0,
  alAbrirCarrito,
  tiendaAbierta = false,
  cargandoTienda = false,
  errorTienda = '',
}) {
  const [scrollY, setScrollY] = useState(0);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    let ultimoScrollY = window.scrollY;

    function manejarScroll() {
      const posicionActual = window.scrollY;
      setScrollY(posicionActual);

      if (posicionActual > ultimoScrollY && posicionActual > 50) {
        setOculto(true);
      } else if (posicionActual < ultimoScrollY) {
        setOculto(false);
      }

      ultimoScrollY = posicionActual;
    }

    window.addEventListener('scroll', manejarScroll);
    return () => window.removeEventListener('scroll', manejarScroll);
  }, []);

  const claseBarra = scrollY > 0 ? 'barra scrolled' : 'barra';
  const claseFinal = oculto ? `${claseBarra} oculto` : claseBarra;

  function irAlCatalogo(evento) {
    evento.preventDefault();
    const catalogo = document.getElementById('productos');

    if (catalogo) {
      catalogo.scrollIntoView({ behavior: 'smooth' });
    } else {
      navegar('/productos');
    }
  }

  return (
      <header className={`${claseFinal} cabecera-pancholab`}>
        <div className="contenedor">
          <div className="barra-contenido">
            <a
              href="/"
              className="logo logo-pancholab"
              onClick={(evento) => {
                evento.preventDefault();
                navegar('/');
              }}
            >
              <span className="logoIcono" aria-hidden="true">🧪</span>
              <span className="logoMarca">
                <span className="logoTexto">PANCHOLAB</span>
                <span className="logoBajada">LABORATORIO DE SABORES</span>
              </span>
            </a>

            <nav className="navegacion" aria-label="Navegación principal">
              <a
                href="/"
                className="activo"
                onClick={(evento) => {
                  evento.preventDefault();
                  navegar('/');
                }}
              >
                Inicio
              </a>
              <a
                href="#productos"
                onClick={irAlCatalogo}
              >
                Productos
              </a>
            </nav>

            {cargandoTienda ? (
              <span className="estado-tienda-verificando" role="status">
                Verificando tienda
              </span>
            ) : !tiendaAbierta ? (
              <span
                className="aviso-tienda-cerrada"
                role="status"
                title={errorTienda || 'Las compras están temporalmente deshabilitadas.'}
              >
                TIENDA CERRADA
              </span>
            ) : null}

            <div className="acciones-cabecera">
              <button
                type="button"
                className="boton-tema"
                aria-label={`Cambiar a modo ${tema === 'oscuro' ? 'claro' : 'oscuro'}`}
                aria-pressed={tema === 'claro'}
                onClick={alCambiarTema}
              >
                <span aria-hidden="true">{tema === 'oscuro' ? '☀' : '☾'}</span>
                <span className="texto-boton-tema">
                  Modo {tema === 'oscuro' ? 'luz' : 'oscuro'}
                </span>
              </button>
              <button
                type="button"
                className="boton-carrito"
                aria-label={`Abrir carrito, ${cantidadCarrito} productos`}
                onClick={alAbrirCarrito}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="contador-carrito" aria-live="polite">
                  {cantidadCarrito}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
  );
}
