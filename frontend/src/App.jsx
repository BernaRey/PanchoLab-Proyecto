import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { auth, tienda as apiTienda } from './services/api.js';
import { useCarrito } from './contextos/CarritoContexto.jsx';
import CarritoPanel from './components/CarritoPanel.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import Home from './pages/Home.jsx';
import PaginaNoEncontrada from './pages/PaginaNoEncontrada.jsx';
import Terminos from './pages/Terminos.jsx';
const PanelAdmin = lazy(() => import('./pages/PanelAdmin.jsx'));
const Login = lazy(() => import('./pages/Login.js'));
const ProductoDetalle = lazy(() => import('./pages/ProductoDetalle.jsx'));

function DetalleProductoEnRuta(props) {
  const { id } = useParams();
  return <ProductoDetalle id={id} {...props} />;
}

export default function App() {
  const ubicacion = useLocation();
  const navegarRouter = useNavigate();
  const ruta = ubicacion.pathname;
  const [usuario, setUsuario] = useState(null);
  const [sesionLista, setSesionLista] = useState(false);
  const [errorSesion, setErrorSesion] = useState('');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(false);
  const [cargandoTienda, setCargandoTienda] = useState(true);
  const [cambiandoTienda, setCambiandoTienda] = useState(false);
  const [errorTienda, setErrorTienda] = useState('');
  const carrito = useCarrito();

  const navegar = useCallback((destino) => navegarRouter(destino), [navegarRouter]);

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

  }, [cargarEstadoTienda, cargarUsuario]);

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
    if (ruta === '/admin' && usuario?.role !== 'admin') navegar('/login');
    if (ruta === '/login' && usuario) navegar('/');
  }, [navegar, ruta, sesionLista, usuario]);

  if (!sesionLista && (ruta === '/login' || ruta === '/admin')) {
    return <main className="estado spinnerCarga">Verificando sesión...</main>;
  }

  if (errorSesion && (ruta === '/login' || ruta === '/admin')) {
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

  if (ruta === '/admin' && usuario?.role !== 'admin') {
    return <main className="estado spinnerCarga">Redirigiendo al acceso de administración...</main>;
  }

  return (
    <>
      <Suspense fallback={<main className="estado spinnerCarga" role="status">Abriendo el laboratorio…</main>}>
        <Routes>
          <Route path="/" element={<Home usuario={usuario} navegar={navegar} {...propiedadesCabecera} {...propiedadesCatalogo} />} />
          <Route path="/productos" element={<Home usuario={usuario} navegar={navegar} {...propiedadesCabecera} {...propiedadesCatalogo} />} />
          <Route path="/login" element={<Login usuario={usuario} navegar={navegar} onAuth={cargarUsuario} {...propiedadesCabecera} />} />
          <Route path="/admin" element={<PanelAdmin usuario={usuario} navegar={navegar} onAuth={cargarUsuario} onCambiarTienda={cambiarEstadoTienda} cambiandoTienda={cambiandoTienda} {...propiedadesCabecera} />} />
          <Route path="/terminos" element={<Terminos usuario={usuario} navegar={navegar} {...propiedadesCabecera} />} />
          <Route path="/producto/:id" element={<DetalleProductoEnRuta usuario={usuario} navegar={navegar} alAgregarProducto={agregarProducto} {...propiedadesCabecera} />} />
          <Route path="*" element={<PaginaNoEncontrada usuario={usuario} navegar={navegar} {...propiedadesCabecera} />} />
        </Routes>
      </Suspense>
      <ChatWidget />
      <CarritoPanel
        abierto={carritoAbierto}
        onCerrar={cerrarCarrito}
        navegar={navegar}
        tiendaAbierta={tiendaAbierta}
        cargandoTienda={cargandoTienda}
      />
    </>
  );
}
