import dotenv from 'dotenv';
dotenv.config();

const SECRETO_SESION_DESARROLLO = 'secreto-dev-cambiar-en-produccion';
const SECRETOS_DE_EJEMPLO = new Set([
  SECRETO_SESION_DESARROLLO,
  'cambiar_esta_clave_en_produccion',
]);

export const env = {
  puerto: process.env.PUERTO || 3000,
  nodeEnv: process.env.NODE_ENV || 'desarrollo',
  mongoUri: process.env.MONGO_URI,
  sessionSecreto: process.env.SESSION_SECRETO || SECRETO_SESION_DESARROLLO,
  whatsappVendedor: process.env.WHATSAPP_VENDEDOR,
};

export function validarConfiguracion() {
  if (
    env.nodeEnv === 'produccion'
    && (SECRETOS_DE_EJEMPLO.has(env.sessionSecreto) || env.sessionSecreto.length < 32)
  ) {
    return ['SESSION_SECRETO debe ser aleatorio, privado y tener al menos 32 caracteres en producción'];
  }
  return [];
}
