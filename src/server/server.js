import app from './app.js';
import { env, validarConfiguracion } from './config/env.js';

const erroresConfiguracion = validarConfiguracion();
if (erroresConfiguracion.length > 0) {
  throw new Error(`Configuración inválida: ${erroresConfiguracion.join('; ')}`);
}

app.listen(env.puerto, () => {
  console.log(`🧪 Pancholab corriendo en http://localhost:${env.puerto}`);
  console.log(`📡 Entorno: ${env.nodeEnv}`);
  if (!env.mongoUri) {
    console.log('⚠️  Advertencia: MONGO_URI no está definida. Las operaciones de la base de datos fallarán.');
  }
});
