import { Product } from '../models/Product.js';
import { env } from '../config/env.js';

const consultasPorIp = new Map();
const VENTANA_LIMITE_MS = 60_000;
const MAX_CONSULTAS_POR_VENTANA = 12;

function respetarLimite(ip) {
  const ahora = Date.now();
  const registro = consultasPorIp.get(ip);

  if (!registro || ahora - registro.inicio >= VENTANA_LIMITE_MS) {
    consultasPorIp.set(ip, { inicio: ahora, cantidad: 1 });
    if (consultasPorIp.size > 2_000) {
      for (const [clave, valor] of consultasPorIp) {
        if (ahora - valor.inicio >= VENTANA_LIMITE_MS) consultasPorIp.delete(clave);
      }
    }
    return true;
  }

  if (registro.cantidad >= MAX_CONSULTAS_POR_VENTANA) return false;
  registro.cantidad += 1;
  return true;
}

function validarHistorial(historial) {
  if (historial === undefined) return [];
  if (!Array.isArray(historial) || historial.length > 6) return null;

  const mensajes = [];
  for (const elemento of historial) {
    if (
      !elemento
      || !['user', 'assistant'].includes(elemento.role)
      || typeof elemento.text !== 'string'
      || elemento.text.trim().length < 1
      || elemento.text.length > 500
    ) return null;

    mensajes.push({
      role: elemento.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: elemento.text.trim() }],
    });
  }

  return mensajes;
}

export async function recomendarSabor(req, res, next) {
  const mensaje = typeof req.body?.mensaje === 'string' ? req.body.mensaje.trim() : '';
  const historial = validarHistorial(req.body?.historial);

  if (!mensaje || mensaje.length > 500 || historial === null) {
    return res.status(400).json({ exito: false, mensaje: 'La consulta no es válida. Escribí una pregunta de hasta 500 caracteres.' });
  }
  if (!respetarLimite(req.ip || req.socket.remoteAddress || 'desconocido')) {
    return res.status(429).json({ exito: false, mensaje: 'Llegamos al límite de consultas por ahora. Probá de nuevo en un minuto.' });
  }
  if (!env.geminiApiKey) {
    return res.status(503).json({ exito: false, mensaje: 'El asistente de sabores todavía no está configurado.' });
  }

  try {
    const productos = await Product.find({ isActive: true })
      .select('name description price stock country ingredients category')
      .limit(24)
      .lean();

    const catalogo = productos.map((producto) => ({
      nombre: producto.name,
      origen: producto.country || 'sin origen especificado',
      descripcion: producto.description,
      ingredientes: producto.ingredients || [],
      precio: producto.price,
      disponible: Number(producto.stock) > 0,
    }));

    const historialCompleto = [
      ...historial,
      {
        role: 'user',
        parts: [{ text: mensaje }],
      },
    ];
    const respuestaProveedor = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModelo)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.geminiApiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: [
                'Sos el asistente de sabores de PanchoLab, un laboratorio cultural de panchos de Colonia, Uruguay.',
                'Respondé en español rioplatense, cercano, breve y con curiosidad gastronómica.',
                'Ayudá a elegir recetas usando exclusivamente el catálogo real incluido abajo. No inventes productos, ingredientes, precios ni stock.',
                'Si preguntan algo ajeno al menú o al negocio, contestá amablemente y volvé al tema de sabores.',
                'Si no hay datos suficientes, decilo con honestidad. No pidas datos personales ni de pago.',
                `Catálogo vigente: ${JSON.stringify(catalogo)}`,
              ].join('\n'),
            }],
          },
          contents: historialCompleto,
          generationConfig: { temperature: 0.65, maxOutputTokens: 420 },
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!respuestaProveedor.ok) {
      if (respuestaProveedor.status === 429) {
        return res.status(429).json({ exito: false, mensaje: 'El laboratorio alcanzó su cuota gratuita de IA por ahora. Probá más tarde.' });
      }
      if (respuestaProveedor.status === 400 || respuestaProveedor.status === 403) {
        console.error('Gemini rechazó la configuración de la solicitud.');
        return res.status(503).json({ exito: false, mensaje: 'El asistente no está disponible en este momento.' });
      }
      return res.status(502).json({ exito: false, mensaje: 'No pudimos conectar con el asistente. Probá de nuevo en un momento.' });
    }

    const datos = await respuestaProveedor.json();
    const texto = datos.candidates?.[0]?.content?.parts
      ?.map((parte) => parte.text || '')
      .join('\n')
      .trim();

    if (!texto) {
      return res.status(502).json({ exito: false, mensaje: 'No llegó una recomendación. Probá con otra pregunta.' });
    }

    return res.json({ exito: true, respuesta: texto });
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return res.status(504).json({ exito: false, mensaje: 'La respuesta está tardando demasiado. Intentá de nuevo.' });
    }
    return next(error);
  }
}
