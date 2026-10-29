import express from 'express';
import session from 'express-session';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { conectarBaseDeDatos, estadoBaseDeDatos } from './config/database.js';
import rutasProductos from './routes/products.js';
import rutasAuth from './routes/auth.js';
import rutasTienda from './routes/tienda.js';
import rutasCheckout from './routes/checkout.js';
import rutasContacto from './routes/contacto.js';
import rutasIa from './routes/ia.js';
import { manejarErrores, rutaNoEncontrada } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
  const origen = req.get('Origin');
  if (!origen) return next();

  const origenLocalDeDesarrollo = env.nodeEnv !== 'produccion'
    && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origen);

  if (!env.corsOrigenes.includes(origen) && !origenLocalDeDesarrollo) {
    return res.status(403).json({ exito: false, mensaje: 'Este origen no esta autorizado para usar la API.' });
  }

  res.setHeader('Access-Control-Allow-Origin', origen);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use(express.json());
app.use(
  session({
    secret: env.sessionSecreto,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: env.sessionSameSite,
      secure: env.nodeEnv === 'produccion',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Contact only prepares a WhatsApp URL, so it does not need MongoDB.
app.use('/api/contacto', rutasContacto);

// Health endpoint stays available while MongoDB is offline and reports a safe diagnostic.
app.get('/api/estado', async (req, res, next) => {
  try {
    await conectarBaseDeDatos();
    const { conectado, error } = estadoBaseDeDatos();
    const advertencia = !conectado
      ? error?.name === 'MongooseServerSelectionError'
        ? 'MongoDB Atlas no acepto la conexion. Autoriza la IP publica de esta computadora en Network Access y verifica que el cluster este activo.'
        : error?.message || 'MongoDB no esta configurado.'
      : undefined;

    return res.json({
      exito: true,
      mensaje: 'API de PanchoLab',
      baseDeDatos: conectado ? 'conectada' : 'desconectada',
      ...(advertencia && { advertencia }),
    });
  } catch (error) {
    return next(error);
  }
});

// Other API routes require MongoDB and return a useful local setup message when it is unavailable.
app.use('/api', async (req, res, next) => {
  try {
    await conectarBaseDeDatos();
    const { conectado, error } = estadoBaseDeDatos();
    req.dbConectado = conectado;
    req.dbError = error;

    if (!conectado) {
      const mensaje = !process.env.MONGO_URI
        ? 'Falta configurar MONGO_URI en el archivo .env.'
        : error?.name === 'MongooseServerSelectionError'
          ? 'No se pudo conectar a MongoDB Atlas. Verifica que la IP publica de esta computadora este autorizada en Network Access y que el cluster este activo.'
          : 'La base de datos no esta disponible. Revisa la conexion y vuelve a intentar.';
      return res.status(503).json({ exito: false, mensaje });
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

app.use('/api/auth', rutasAuth);
app.use('/api/products', rutasProductos);
app.use('/api/tienda', rutasTienda);
app.use('/api/checkout', rutasCheckout);
app.use('/api/ia', rutasIa);

// Serve the Vite build when present; keep the old public site as a fallback for direct server runs.
const rutaPublic = path.join(__dirname, '../../public');
const rutaDist = path.join(__dirname, '../../dist');
const rutaFrontend = existsSync(path.join(rutaDist, 'index.html')) ? rutaDist : rutaPublic;
app.use(express.static(rutaFrontend));

app.get('*', (req, res) => {
  res.sendFile(path.join(rutaFrontend, 'index.html'));
});

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
