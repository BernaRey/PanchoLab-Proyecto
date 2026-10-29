import React from 'react';

export default function Footer({ navegar = () => {} }) {
  const anio = new Date().getFullYear();

  return (
    <footer className="piePagina">
      <div className="contenido">
        <div className="marca">
          <a href="/" className="logo logo-pancholab" onClick={(evento) => { evento.preventDefault(); navegar('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span className="logoIcono" aria-hidden="true">✳</span>
            <span className="logoMarca"><span className="logoTexto">PANCHOLAB</span><span className="logoBajada">LABORATORIO DE SABORES</span></span>
          </a>
          <p>Un laboratorio de recetas con pasaporte. Cultura, fuego e ingredientes reales en cada pancho.</p>
          <div className="redes">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="redSocial" aria-label="Instagram">ig</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="redSocial" aria-label="TikTok">tk</a>
          </div>
        </div>
        <div className="columna">
          <h4>Explorar</h4>
          <ul className="lista">
            <li><a href="/" onClick={(evento) => { evento.preventDefault(); navegar('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Inicio</a></li>
            <li><a href="/productos" onClick={(evento) => { evento.preventDefault(); navegar('/productos'); document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' }); }}>La carta</a></li>
            <li><a href="#laboratorio" onClick={(evento) => document.getElementById('laboratorio')?.scrollIntoView({ behavior: 'smooth' })}>El laboratorio</a></li>
          </ul>
        </div>
        <div className="columna">
          <h4>Encontranos</h4>
          <ul className="lista">
            <li>Colonia del Sacramento, Uruguay</li>
            <li><a href="#contacto" onClick={(evento) => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}>Escribinos por WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="inferior">
        <p>© {anio} PanchoLab. Hecho con hambre de mundo.</p>
        <div className="legal"><a href="/login" onClick={(evento) => { evento.preventDefault(); navegar('/login'); }}>Acceso administrador</a></div>
      </div>
    </footer>
  );
}
