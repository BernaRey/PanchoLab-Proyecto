import { env } from '../config/env.js';

function textoValido(valor, min, max) {
  return typeof valor === 'string' && valor.trim().length >= min && valor.trim().length <= max;
}

export function prepararMensajeWhatsApp(req, res) {
  const { nombre, correo, mensaje } = req.body || {};

  if (!textoValido(nombre, 2, 80)) {
    return res.status(400).json({ exito: false, mensaje: 'El nombre debe tener entre 2 y 80 caracteres.' });
  }
  if (!textoValido(correo, 5, 120) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
    return res.status(400).json({ exito: false, mensaje: 'Ingresá un correo electrónico válido.' });
  }
  if (!textoValido(mensaje, 5, 700)) {
    return res.status(400).json({ exito: false, mensaje: 'El mensaje debe tener entre 5 y 700 caracteres.' });
  }

  const telefono = String(env.whatsappVendedor || '').replace(/\D/g, '');
  if (telefono.length < 8 || telefono.length > 15) {
    return res.status(503).json({
      exito: false,
      mensaje: 'El contacto por WhatsApp todavía no está configurado. Escribinos más tarde.',
    });
  }

  const texto = [
    'Hola, PanchoLab. Quiero ponerme en contacto.',
    '',
    `Nombre: ${nombre.trim()}`,
    `Correo: ${correo.trim()}`,
    '',
    mensaje.trim(),
  ].join('\n');

  return res.json({
    exito: true,
    url: `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`,
  });
}
