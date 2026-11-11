import { useState } from 'react';
import { enviarMensajeChat } from '../services/api.js';
import '../estilos/chat-widget.css';

function crearMensaje(role, text, error = false) {
  return { id: window.crypto.randomUUID(), role, text, error };
}

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [conversacionId, setConversacionId] = useState(null);
  const [mensajes, setMensajes] = useState(() => [
    crearMensaje('assistant', '¡Hola! Soy el asistente de PanchoLab. Puedo ayudarte con productos, horarios y envíos.'),
  ]);

  async function enviar(evento) {
    evento.preventDefault();
    const mensaje = entrada.trim();
    if (!mensaje || cargando) return;

    setMensajes((actuales) => [...actuales, crearMensaje('user', mensaje)]);
    setEntrada('');
    setCargando(true);

    try {
      const resultado = await enviarMensajeChat(mensaje, conversacionId);
      setConversacionId(resultado.conversacionId);
      setMensajes((actuales) => [...actuales, crearMensaje('assistant', resultado.respuesta)]);
    } catch (error) {
      setMensajes((actuales) => [...actuales, crearMensaje(
        'assistant',
        error.message || 'No pude responder ahora. Probá de nuevo en un momento.',
        true,
      )]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <aside className={`chat-widget ${abierto ? 'chat-widget-abierto' : ''}`} aria-label="Chat de PanchoLab">
      {abierto && (
        <section className="chat-widget-ventana" aria-label="Asistente de PanchoLab">
          <header className="chat-widget-cabecera">
            <span className="chat-widget-avatar" aria-hidden="true">PL</span>
            <div>
              <strong>Asistente de sabores</strong>
              <small>Productos · horarios · envíos</small>
            </div>
            <button
              type="button"
              className="chat-widget-cerrar"
              aria-label="Cerrar chat"
              onClick={() => setAbierto(false)}
            >
              ×
            </button>
          </header>

          <div className="chat-widget-mensajes" role="log" aria-live="polite" aria-relevant="additions text">
            {mensajes.map((mensaje) => (
              <p
                key={mensaje.id}
                className={`chat-widget-mensaje ${mensaje.role === 'user' ? 'chat-widget-mensaje-usuario' : ''} ${mensaje.error ? 'chat-widget-mensaje-error' : ''}`}
              >
                {mensaje.text}
              </p>
            ))}
            {cargando && <p className="chat-widget-mensaje" role="status">Escribiendo…</p>}
          </div>

          <form className="chat-widget-formulario" onSubmit={enviar}>
            <label className="solo-lectores" htmlFor="chat-widget-entrada">Tu pregunta</label>
            <input
              id="chat-widget-entrada"
              type="text"
              value={entrada}
              maxLength={500}
              onChange={(evento) => setEntrada(evento.target.value)}
              placeholder="¿Qué te gustaría saber?"
              disabled={cargando}
              autoComplete="off"
            />
            <button type="submit" aria-label="Enviar mensaje" disabled={cargando || !entrada.trim()}>
              ↑
            </button>
          </form>
          <p className="chat-widget-nota">No compartas datos personales. Si no tenemos un dato confirmado, consultá al local.</p>
        </section>
      )}

      <button
        type="button"
        className="chat-widget-boton"
        aria-expanded={abierto}
        aria-label={abierto ? 'Cerrar el chat de PanchoLab' : 'Abrir el chat de PanchoLab'}
        onClick={() => setAbierto((actual) => !actual)}
      >
        <span className="chat-widget-punto" aria-hidden="true" />
        {abierto ? 'Cerrar el chat' : 'Encontrá tu sabor'}
        <span aria-hidden="true">{abierto ? '×' : '✳'}</span>
      </button>
    </aside>
  );
}
