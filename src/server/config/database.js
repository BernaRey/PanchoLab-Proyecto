import mongoose from 'mongoose';

let conectado = false;
let errorConexion = null;
let conexionEnCurso = null;

export async function conectarBaseDeDatos() {
  if (mongoose.connection.readyState === 1) {
    conectado = true;
    errorConexion = null;
    return;
  }

  if (!process.env.MONGO_URI) {
    conectado = false;
    errorConexion = new Error('Falta la variable de entorno MONGO_URI.');
    return;
  }

  if (conexionEnCurso) {
    await conexionEnCurso;
    return;
  }

  conexionEnCurso = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      conectado = true;
      errorConexion = null;
      console.log('Conectado a MongoDB');
    })
    .catch((error) => {
      conectado = false;
      errorConexion = error;
      console.error('No se pudo conectar a MongoDB:', error.message);
    })
    .finally(() => {
      conexionEnCurso = null;
    });

  await conexionEnCurso;
}

export function estadoBaseDeDatos() {
  return {
    conectado: mongoose.connection.readyState === 1 || conectado,
    error: errorConexion,
  };
}