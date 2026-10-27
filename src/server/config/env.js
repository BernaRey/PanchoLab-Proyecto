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

  // Reconoce tanto el valor de Node.js como el nombre usado por el proyecto.
  nodeEnv: ['production', 'produccion'].includes(nodeEnvOriginal)
    ? 'produccion'
    : nodeEnvOriginal,

  mongoUri: process.env.MONGO_URI,

  sessionSecreto:
    process.env.SESSION_SECRETO || SECRETO_SESION_DESARROLLO,

  whatsappVendedor: process.env.WHATSAPP_VENDEDOR,
};

export function validarConfiguracion() {
  const errores = [];

  if (env.nodeEnv === 'produccion') {
    if (
      !env.sessionSecreto ||
      SECRETOS_DE_EJEMPLO.has(env.sessionSecreto) ||
      env.sessionSecreto.length < 32
    ) {
      errores.push(
        'SESSION_SECRETO debe ser aleatorio, privado y tener al menos 32 caracteres en producción.',
      );
    }

    if (!env.mongoUri) {
      errores.push(
        'MONGO_URI es obligatoria en producción.',
      );
    }
  }

  if (
    process.env.PUERTO &&
    (!Number.isInteger(Number(process.env.PUERTO)) ||
      Number(process.env.PUERTO) < 1 ||
      Number(process.env.PUERTO) > 65535)
  ) {
    errores.push('PUERTO debe ser un número entero entre 1 y 65535.');
  }

  return errores;
}