import 'dotenv/config';
import mongoose from 'mongoose';
import { conectarBaseDeDatos, estadoBaseDeDatos } from '../src/server/config/database.js';
import { User } from '../src/server/models/User.js';

async function crearAdministrador() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || username.length < 3 || username.length > 30) {
    throw new Error('ADMIN_USERNAME debe tener entre 3 y 30 caracteres.');
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    throw new Error('ADMIN_PASSWORD debe tener entre 12 y 128 caracteres.');
  }

  await conectarBaseDeDatos();
  if (!estadoBaseDeDatos().conectado) {
    throw new Error('No se pudo conectar a MongoDB; el administrador no fue creado.');
  }

  const administradorExistente = await User.findOne({ role: 'admin' }).select('_id').lean();
  if (administradorExistente) {
    throw new Error('Ya existe una cuenta administradora. No se creó otra.');
  }

  const usuarioExistente = await User.findOne({ username }).select('_id').lean();
  if (usuarioExistente) {
    throw new Error('Ese nombre de usuario ya existe. Elegí otro para el administrador.');
  }

  const usuario = new User({ username, role: 'admin' });
  usuario.setPassword(password);
  await usuario.save();
  console.log(`Cuenta administradora creada: ${username}`);
}

try {
  await crearAdministrador();
} catch (error) {
  console.error(`No se pudo crear el administrador: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
