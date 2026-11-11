import { GoogleGenAI } from '@google/genai';
import { Product } from '../models/Product.js';
import { conectarBaseDeDatos, estadoBaseDeDatos } from '../config/database.js';
import { env } from '../config/env.js';

const ai = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;
const MENSAJE_CUOTA = 'Estoy recibiendo muchas preguntas, intenta en un minuto';
const MENSAJE_ERROR = 'No pude responder ahora. Probá de nuevo en un momento.';

function esLimiteGemini(error) {
  const codigo = error?.status ?? error?.code ?? error?.error?.code;
  return Number(codigo) === 429
    || codigo === 'RESOURCE_EXHAUSTED'
    || /\b429\b|RESOURCE_EXHAUSTED/i.test(String(error?.message || ''));
}

function crearInstrucciones(catalogo) {
  return [
    'Sos el asistente de PanchoLab, un emprendimiento de Colonia, Uruguay que vende panchos y bebidas.',
    'Respondé siempre en español, de forma breve, amable y sencilla.',
    'Solo ayudás con productos, horarios de atención y envíos. Si preguntan otra cosa, respondé amablemente que solo podés ayudar con la tienda.',
    'Usá solamente los datos de productos del catálogo que aparece abajo. No inventes precios, ingredientes, stock ni disponibilidad.',
    'No hay horarios, zonas ni costos de envío confirmados en la información disponible. Si preguntan por eso, decí que no tenés el dato confirmado e invitalos a consultar al local por WhatsApp.',
    'No solicites contraseñas, datos de pago ni otra información sensible.',
    `Catálogo vigente: ${JSON.stringify(catalogo)}`,
  ].join('\n');
}

export async function atenderChat(req, res) {
  const mensajeOriginal = req.body?.mensaje;
  const mensaje = typeof mensajeOriginal === 'string' ? mensajeOriginal.trim() : '';

  if (!mensaje || mensajeOriginal.length > 500) {
    return res.status(400).json({ mensaje: 'Escribí un mensaje de hasta 500 caracteres.' });
  }

  if (!ai) {
    return res.status(500).json({ mensaje: MENSAJE_ERROR });
  }

  try {
    await conectarBaseDeDatos();
    if (!estadoBaseDeDatos().conectado) {
      return res.status(500).json({ mensaje: MENSAJE_ERROR });
    }

    const productos = await Product.find({ isActive: true })
      .select('name description price stock category country ingredients')
      .limit(40)
      .lean();

    const catalogo = productos.map((producto) => ({
      nombre: producto.name,
      descripcion: producto.description,
      precio: producto.price,
      disponible: Number(producto.stock) > 0,
      categoria: producto.category,
      origen: producto.country || undefined,
      ingredientes: producto.ingredients || [],
    }));

    const conversacionId = typeof req.body?.conversacionId === 'string'
      ? req.body.conversacionId.trim()
      : '';
    const interaccion = await ai.interactions.create({
      model: env.geminiModelo,
      input: mensaje,
      system_instruction: crearInstrucciones(catalogo),
      ...(conversacionId ? { previous_interaction_id: conversacionId } : {}),
    });

    const respuesta = interaccion.output_text?.trim();
    if (!respuesta || !interaccion.id) {
      throw new Error('Gemini devolvió una interacción sin respuesta completa.');
    }

    return res.json({ respuesta, conversacionId: interaccion.id });
  } catch (error) {
    console.error('Falló una solicitud del chat de PanchoLab:', error?.status || error?.code || error?.name || 'error desconocido');
    if (esLimiteGemini(error)) {
      return res.status(429).json({ mensaje: MENSAJE_CUOTA });
    }
    return res.status(500).json({ mensaje: MENSAJE_ERROR });
  }
}
