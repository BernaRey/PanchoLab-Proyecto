import dotenv from 'dotenv';
dotenv.config();

import { conectarBaseDeDatos } from './src/server/config/database.js';
import { User } from './src/server/models/User.js';

(async () => {
  try {
    await conectarBaseDeDatos();

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      console.error('ERROR: Define ADMIN_PASSWORD en .env para crear el primer administrador.');
      process.exit(1);
    }

    const existente = await User.findOne({ username });
    if (existente) {
      console.log(`El administrador "${username}" ya existe.`);
      process.exit(0);
    }

    const usuario = new User({ username, role: 'admin' });
    usuario.setPassword(password);
    await usuario.save();

    console.log(`✅ Primer administrador creado: ${username} (rol: admin)`);
    process.exit(0);
  } catch (err) {
    console.error('Error creando administrador:', err.message);
    process.exit(1);
  }
})();
