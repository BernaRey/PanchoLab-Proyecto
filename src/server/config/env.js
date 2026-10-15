import dotenv from 'dotenv';
dotenv.config();

export const env = {
  puerto: process.env.PUERTO || 3000,
  nodeEnv: process.env.NODE_ENV || 'desarrollo',
  mongoUri: process.env.MONGO_URI,
  sessionSecreto: process.env.SESSION_SECRETO || 'secreto-dev-cambiar-en-produccion',
};

export function validarConfiguracion() {
  const faltantes = [];
  if (!env.mongoUri) faltantes.push('MONGO_URI');
  if (!env.sessionSecreto || env.sessionSecreto === 'secreto-dev-cambiar-en-produccion') {
    faltantes.push('SESSION_SECRETO (usa un valor seguro en producción)');
  }
  return faltantes;
}
