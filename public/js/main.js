import { auth } from './services/api.js';

const React = window.React;
const { createRoot } = window.ReactDOM;
import Home from './pages/Home.js';
import ProductoDetalle from './pages/ProductoDetalle.js';
import Login from './pages/Login.js';
import PanelAdmin from './pages/PanelAdmin.js';

window.api = { auth };

const contenedor = document.getElementById('raiz');
const root = createRoot(contenedor);

let usuario = null;
let navegando = false; // evita bucles infinitos de redirección

function rutaActual() {
  const path = window.location.pathname;
  if (path === '/' || path === '' || path === '/productos') return 'home';
  if (path === '/login') return 'login';
  if (path === '/admin') return 'admin';
  const m = path.match(/^\/producto\/([^/]+)$/);
  if (m) return { tipo: 'producto', id: m[1] };
  return 'home';
}

function navegar(path) {
  if (navegando) return;
  navegando = true;
  window.history.pushState({}, '', path);
  setTimeout(() => { navegando = false; }, 100);
  renderConSeguro();
}

async function cargarUsuario() {
  try {
    const respuesta = await auth.me();
    usuario = respuesta.usuario;
  } catch (_) {
    usuario = null;
  }
}

function render() {
  const ruta = rutaActual();
  let elemento;

  const comunes = { usuario, navegar };

  if (ruta === 'home') {
    elemento = React.createElement(Home, comunes);
  } else if (ruta && ruta.tipo === 'producto') {
    elemento = React.createElement(ProductoDetalle, { ...comunes, id: ruta.id });
  } else if (ruta === 'login') {
    elemento = React.createElement(Login, { ...comunes, onAuth: cargarUsuario });
  } else if (ruta === 'admin') {
    elemento = React.createElement(PanelAdmin, { ...comunes, onAuth: cargarUsuario });
  } else {
    elemento = React.createElement(Home, comunes);
  }

  root.render(elemento);
}

function renderConSeguro() {
  try {
    render();
  } catch (err) {
    console.error('Error al renderizar React:', err);
    const raiz = document.getElementById('raiz');
    if (raiz) {
      raiz.innerHTML = `
        <div style="padding:2rem;font-family:sans-serif;text-align:center;color:#fff;background:#0a0a0f;">
          <h2 style="color:#ff2d95;">Error al cargar la aplicación</h2>
          <p>${err.message}</p>
          <p style="font-size:0.9rem;color:#a0a0b0;">Revisá la consola del navegador (F12) para más detalles.</p>
        </div>
      `;
    }
  }
}

async function iniciar() {
  try {
    await cargarUsuario();
  } catch (_) {
    usuario = null;
  }
  renderConSeguro();
}

window.addEventListener('popstate', renderConSeguro);

iniciar();
