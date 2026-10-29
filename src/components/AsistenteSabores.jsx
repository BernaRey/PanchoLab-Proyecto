import React, { useState } from 'react';
import { inteligencia } from '../services/api.js';

const saludo = {
  role: 'assistant',
  text: '¡Hola! Soy el asistente de sabores de PanchoLab. Contame qué te gusta y te recomiendo un viaje.' ,
};

export default function AsistenteSabores({ productos = [] }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([saludo]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const texto = entrada.trim();
    if (!texto || cargando) return;

    const historial = [...mensajes, { role: 'user', text: texto }];
    setMensajes(historial);
    setEntrada('');
    setCargando(true);
    try {
      const contexto = historial.slice(1, -1).slice(-6);
      const respuesta = await inteligencia.consultar(texto, contexto);
      setMensajes((actuales) => [...actuales, { role: 'assistant', text: respuesta.respuesta }]);
    } catch (error) {
      setMensajes((actuales) => [...actuales, {
        role: 'assistant',
        text: error.message || 'El laboratorio está tomando aire. Probá de nuevo en un momento.',
        error: true,
      }]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <aside className={`asistente-sabores ${abierto ? 'asistente-abierto' : ''}`} aria-label="Asistente de sabores PanchoLab">
      {abierto && (
        <section className="asistente-ventana" aria-label="Chat de recomendaciones">
          <header className="asistente-cabecera">
            <span className="asistente-avatar" aria-hidden="true">PL</span>
            <div><strong>Asistente de sabores</strong><small>Consultor del laboratorio</small></div>
            <button type="button" className="asistente-cerrar" aria-label="Cerrar asistente" onClick={() => setAbierto(false)}>×</button>
          </header>
          <div className="asistente-mensajes" aria-live="polite" aria-relevant="additions text">
            {mensajes.map((mensaje, indice) => (
              <p key={`${indice}-${mensaje.role}`} className={`burbuja-chat ${mensaje.role === 'user' ? 'burbuja-usuario' : ''} ${mensaje.error ? 'burbuja-error' : ''}`}>
                {mensaje.text}
              </p>
            ))}
            {cargando && <p className="burbuja-chat" role="status">Consultando el recetario…</p>}
          </div>
          <form className="asistente-formulario" onSubmit={enviar}>
            <label className="solo-lectores" htmlFor="pregunta-sabor">Tu pregunta</label>
            <input id="pregunta-sabor" value={entrada} maxLength={500} onChange={(e) => setEntrada(e.target.value)} placeholder="¿Qué me recomendás?" disabled={cargando} />
            <button type="submit" disabled={cargando || !entrada.trim()} aria-label="Enviar consulta">↑</button>
          </form>
          <span className="asistente-nota">No compartas datos personales. Sugerencias segun el recetario.</span>
        </section>
      )}
      <button type="button" className="asistente-boton" aria-expanded={abierto} onClick={() => setAbierto((actual) => !actual)}>
        <span className="asistente-punto" aria-hidden="true" />{abierto ? 'Cerrar el laboratorio' : 'Encontrá tu sabor'}
        <span aria-hidden="true">{abierto ? '×' : '✳'}</span>
      </button>
    </aside>
  );
}
