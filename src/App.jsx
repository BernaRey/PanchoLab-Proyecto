import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { auth, tienda as apiTienda } from './services/api.js';
import { useCarrito } from './contextos/CarritoContexto.jsx';
import CarritoPanel from './components/CarritoPanel.jsx';
import Home from './pages/Home.jsx';
const PanelAdmin = lazy(() => import('./pages/PanelAdmin.jsx'));
const Login = lazy(() => import('./pages/Login.js'));
const ProductoDetalle = lazy(() => import('./pages/ProductoDetalle.jsx'));

const baseAplicacion = import.meta.env.BASE_URL || '/';
const enGitHubPages = baseAplicacion !== '/';

function obtenerRutaActual() {
  let ruta = window.location.pathname;
  if (enGitHubPages && window.location.hash.startsWith('#/')) {
    ruta = window.location.hash.slice(1);
  } else if (enGitHubPages && ruta.startsWith(baseAplicacion)) {
    ruta = `/${ruta.slice(baseAplicacion.length)}`;
  }
  if (!ruta) ruta = '/';
  if (ruta.length > 1) ruta = ruta.replace(/\/$/, '');

  if (ruta === '/' || ruta === '/productos') return 'home';
  if (ruta === '/login') return 'login';
  if (ruta === '/admin') return 'admin';

  const coincidencia = ruta.match(/^\/producto\/([^/]+)$/);
  if (coincidencia) return { tipo: 'producto', id: coincidencia[1] };

  return 'home';
}

export default function App() {
  const [ruta, setRuta] = useState(obtenerRutaActual);
  const [usuario, setUsuario] = useState(null);
  const [sesionLista, setSesionLista] = useState(false);
  const [errorSesion, setErrorSesion] = useState('');
  const [tema, setTema] = useState('oscuro');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(false);
  const [cargandoTienda, setCargandoTienda] = useState(true);
  const [cambiandoTienda, setCambiandoTienda] = useState(false);
  const [errorTienda, setErrorTienda] = useState('');
  const carrito = useCarrito();

  const navegar = useCallback((destino) => {
    if (enGitHubPages) {
      window.location.hash = destino;
    } else {
      window.history.pushState({}, '', destino);
    }
    setRuta(obtenerRutaActual());
  }, []);

  const cargarUsuario = useCallback(async () => {
    try {
      const respuesta = await auth.me();
      setUsuario(respuesta.usuario || null);
      setErrorSesion('');
    } catch (error) {
      if (error.status === 401) {
        setUsuario(null);
        setErrorSesion('');
      } else {
        setErrorSesion(error.message || 'No se pudo verificar la sesión.');
      }
    } finally {
      setSesionLista(true);
    }
  }, []);

  const cargarEstadoTienda = useCallback(async () => {
    setCargandoTienda(true);
    try {
      const respuesta = await apiTienda.obtenerEstado();
      if (typeof respuesta.abierta !== 'boolean') {
        throw new Error('La respuesta del estado de la tienda no es válida.');
      }
      setTiendaAbierta(respuesta.abierta);
      setErrorTienda('');
    } catch (error) {
      setTiendaAbierta(false);
      setErrorTienda(error.message || 'No se pudo verificar el estado de la tienda.');
    } finally {
      setCargandoTienda(false);
    }
  }, []);

  const cambiarEstadoTienda = useCallback(async () => {
    setCambiandoTienda(true);
    setErrorTienda('');
    try {
      const respuesta = await apiTienda.actualizarEstado(!tiendaAbierta);
      if (typeof respuesta.abierta !== 'boolean') {
        throw new Error('La respuesta del estado de la tienda no es válida.');
      }
      setTiendaAbierta(respuesta.abierta);
      return { exito: true, mensaje: respuesta.mensaje };
    } catch (error) {
      await cargarEstadoTienda();
      setErrorTienda(error.message || 'No se pudo cambiar el estado de la tienda.');
      return {
        exito: false,
        mensaje: error.message || 'No se pudo cambiar el estado de la tienda.',
      };
    } finally {
      setCambiandoTienda(false);
    }
  }, [cargarEstadoTienda, tiendaAbierta]);

  useEffect(() => {
    void cargarUsuario();
    void cargarEstadoTienda();

    function actualizarRuta() {
      setRuta(obtenerRutaActual());
    }

    window.addEventListener('popstate', actualizarRuta);
    window.addEventListener('hashchange', actualizarRuta);
    return () => {
      window.removeEventListener('popstate', actualizarRuta);
      window.removeEventListener('hashchange', actualizarRuta);
    };
  }, [cargarEstadoTienda, cargarUsuario]);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  const cambiarTema = useCallback(() => {
    setTema((temaActual) => (temaActual === 'oscuro' ? 'claro' : 'oscuro'));
  }, []);

  const abrirCarrito = useCallback(() => setCarritoAbierto(true), []);
  const cerrarCarrito = useCallback(() => setCarritoAbierto(false), []);
  const agregarProducto = useCallback((producto) => {
    if (cargandoTienda) {
      return { exito: false, mensaje: 'Estamos verificando el estado de la tienda.' };
    }
    if (!tiendaAbierta) {
      return { exito: false, mensaje: 'La tienda está cerrada. No se pueden agregar productos.' };
    }
    return carrito.agregarProducto(producto);
  }, [carrito.agregarProducto, cargandoTienda, tiendaAbierta]);

  const propiedadesCabecera = {
    tema,
    alCambiarTema: cambiarTema,
    cantidadCarrito: carrito.cantidadTotal,
    alAbrirCarrito: abrirCarrito,
    tiendaAbierta,
    cargandoTienda,
    errorTienda,
  };
  const propiedadesCatalogo = {
    alAgregarProducto: agregarProducto,
    tiendaAbierta,
    cargandoTienda,
  };

  useEffect(() => {
    if (!sesionLista) return;
    if (ruta === 'admin' && usuario?.role !== 'admin') navegar('/login');
    if (ruta === 'login' && usuario) navegar('/');
  }, [navegar, ruta, sesionLista, usuario]);

  if (!sesionLista && (ruta === 'login' || ruta === 'admin')) {
    return <main className="estado spinnerCarga">Verificando sesión...</main>;
  }

  if (errorSesion && (ruta === 'login' || ruta === 'admin')) {
    return (
      <main className="estado mensajeError" role="alert">
        <p>{errorSesion}</p>
        <button
          className="boton boton-primario"
          onClick={() => {
            setSesionLista(false);
            void cargarUsuario();
          }}
        >
          Reintentar
        </button>
      </main>
    );
  }

  if (ruta === 'admin' && usuario?.role !== 'admin') {
    return <main className="estado spinnerCarga">Redirigiendo al acceso de administración...</main>;
  }

  let pagina;

  if (ruta === 'home') {
    pagina = (
      <Home
        usuario={usuario}
        navegar={navegar}
        {...propiedadesCabecera}
        {...propiedadesCatalogo}
      />
    );
  } else if (ruta === 'login') {
    pagina = (
      <Login
        usuario={usuario}
        navegar={navegar}
        onAuth={cargarUsuario}
        {...propiedadesCabecera}
      />
    );
  } else if (ruta === 'admin') {
    pagina = (
      <PanelAdmin
        usuario={usuario}
        navegar={navegar}
        onAuth={cargarUsuario}
        onCambiarTienda={cambiarEstadoTienda}
        cambiandoTienda={cambiandoTienda}
        {...propiedadesCabecera}
      />
    );
  } else if (typeof ruta === 'object' && ruta.tipo === 'producto') {
    pagina = (
      <ProductoDetalle
        id={ruta.id}
        usuario={usuario}
        navegar={navegar}
        alAgregarProducto={agregarProducto}
        {...propiedadesCabecera}
      />
    );
  } else {
    pagina = <Home usuario={usuario} navegar={navegar} {...propiedadesCabecera} />;
  }

  return (
    <>
      <Suspense fallback={<main className="estado spinnerCarga" role="status">Abriendo el laboratorio…</main>}>
        {pagina}
      </Suspense>
      <CarritoPanel
        abierto={carritoAbierto}
        onCerrar={cerrarCarrito}
        tiendaAbierta={tiendaAbierta}
        cargandoTienda={cargandoTienda}
      />
    </>
  );
}
