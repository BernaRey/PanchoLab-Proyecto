import mongoose from 'mongoose';

let conectado = false;
let errorConexion = null;

export async function conectarBaseDeDatos() {
  if (!process.env.MONGO_URI) {
    const mensaje = 'ERROR: Falta la variable de entorno MONGO_URI. Crea un archivo .env basado en .env.example.';
    console.error(mensaje);
    errorConexion = new Error(mensaje);
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    conectado = true;
    console.log('Conectado a MongoDB');
  } catch (error) {
    conectado = false;
    errorConexion = error;
    console.error('No se pudo conectar a MongoDB:', error.message);
  }
}

export function estadoBaseDeDatos() {
  return { conectado, error: errorConexion };
}
