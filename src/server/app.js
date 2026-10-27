import express from 'express';
import session from 'express-session';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { conectarBaseDeDatos, estadoBaseDeDatos } from './config/database.js';
import rutasProductos from './routes/products.js';
import rutasAuth from './routes/auth.js';
import rutasTienda from './routes/tienda.js';
import rutasCheckout from './routes/checkout.js';
import { manejarErrores, rutaNoEncontrada } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use(
  session({
    secret: env.sessionSecreto,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'produccion',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Conectar a MongoDB (no bloqueante: el frontend sigue sirviéndose aunque no haya BD)
conectarBaseDeDatos();

// Estado de la base de datos disponible en las rutas de la API
app.use('/api', (req, res, next) => {
  const { conectado, error } = estadoBaseDeDatos();
  req.dbConectado = conectado;
  req.dbError = error;
  next();
});

// Rutas de la API (prefijo /api)
app.use('/api/auth', rutasAuth);
app.use('/api/products', rutasProductos);
app.use('/api/tienda', rutasTienda);
app.use('/api/checkout', rutasCheckout);

// Ruta de estado de la API
app.get('/api/estado', (req, res) => {
  const { conectado, error } = estadoBaseDeDatos();
  res.json({
    exito: true,
    mensaje: 'API de Pancholab',
    baseDeDatos: conectado ? 'conectada' : 'desconectada',
    ...(!conectado && { advertencia: error ? error.message : 'MongoDB no configurado' }),
  });
});

// Priorizar la compilación de Vite y conservar el frontend actual si aún no se compiló.
const rutaPublic = path.join(__dirname, '../../public');
const rutaDist = path.join(__dirname, '../../dist');
const rutaFrontend = existsSync(path.join(rutaDist, 'index.html')) ? rutaDist : rutaPublic;
app.use(express.static(rutaFrontend));

// Enrutado de página única: cualquier ruta que no sea API devuelve el index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(rutaFrontend, 'index.html'));
});

// Manejo de errores (debe ir al final)
app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
