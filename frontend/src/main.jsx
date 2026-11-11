import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CarritoProveedor } from './contextos/CarritoContexto.jsx';
import './estilos/tema.css';
import './estilos/cabecera.css';
import './estilos/catalogo.css';
import './estilos/admin-productos.css';
import './estilos/experiencia.css';

const contenedor = document.getElementById('raiz');

if (!contenedor) {
  throw new Error('No se encontró el contenedor principal de Pancholab.');
}

createRoot(contenedor).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <CarritoProveedor>
      <App />
    </CarritoProveedor>
  </BrowserRouter>
);
