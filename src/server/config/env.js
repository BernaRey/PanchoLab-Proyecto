import dotenv from 'dotenv';

dotenv.config();

const SECRETO_SESION_DESARROLLO = 'secreto-dev-cambiar-en-produccion';
const SECRETOS_DE_EJEMPLO = new Set([
  SECRETO_SESION_DESARROLLO,
  'cambiar_esta_clave_en_produccion',
]);
const nodeEnvOriginal = (process.env.NODE_ENV || 'desarrollo').toLowerCase();

export const env = {
  puerto: Number(process.env.PUERTO) || 3000,
  nodeEnv: ['production', 'produccion'].includes(nodeEnvOriginal) ? 'produccion' : nodeEnvOriginal,
  mongoUri: process.env.MONGO_URI,
  sessionSecreto: process.env.SESSION_SECRETO || SECRETO_SESION_DESARROLLO,
  whatsappVendedor: process.env.WHATSAPP_VENDEDOR,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModelo: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  corsOrigenes: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
  sessionSameSite: process.env.SESSION_COOKIE_SAME_SITE
    || (['production', 'produccion'].includes(nodeEnvOriginal) ? 'none' : 'lax'),
};

export function validarConfiguracion() {
  const errores = [];

  if (!['lax', 'strict', 'none'].includes(env.sessionSameSite)) {
    errores.push('SESSION_COOKIE_SAME_SITE debe ser lax, strict o none.');
  }

  if (env.nodeEnv === 'produccion') {
    if (
      !env.sessionSecreto
      || SECRETOS_DE_EJEMPLO.has(env.sessionSecreto)
      || env.sessionSecreto.length < 32
    ) {
      errores.push('SESSION_SECRETO debe ser aleatorio, privado y tener al menos 32 caracteres en produccion.');
    }
    if (!env.mongoUri) errores.push('MONGO_URI es obligatoria en produccion.');
    if (env.corsOrigenes.length === 0) {
      errores.push('CORS_ORIGINS debe incluir el origen exacto de GitHub Pages en produccion.');
    }
    if (env.corsOrigenes.includes('*')) {
      errores.push('CORS_ORIGINS no admite el comodin * cuando se usan sesiones con credenciales.');
    }
  }

  if (
    process.env.PUERTO
    && (!Number.isInteger(Number(process.env.PUERTO))
      || Number(process.env.PUERTO) < 1
      || Number(process.env.PUERTO) > 65535)
  ) {
    errores.push('PUERTO debe ser un numero entero entre 1 y 65535.');
  }

  return errores;
}
