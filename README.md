# PanchoLab

Sitio para un local de panchos y bebidas. Incluye catálogo, carrito, contacto por WhatsApp, acceso de administración y un asistente con Gemini.

## Carpetas

- `frontend/`: aplicación React, estilos y archivos públicos. Vite genera el sitio en `frontend/dist/`.
- `backend/`: API Express, conexión a MongoDB, modelos, rutas y script para crear el administrador.
- `api/`: entrada que usa Vercel para conectar las rutas `/api/*` con Express.
- `.github/workflows/`: publicación automática del sitio en GitHub Pages.

El proyecto usa un solo `package.json`, un solo `package-lock.json` y una instalación de dependencias en la raíz.

## Ejecutar en la computadora

1. Instalar Node.js 20 o superior y ejecutar `npm install`.
2. Copiar `backend/.env.example` como `backend/.env` y completar los datos necesarios.
3. Abrir dos terminales: ejecutar `npm run dev:server` en una y `npm run dev` en la otra.
4. Abrir la dirección local que muestra Vite, normalmente `http://localhost:5173`.

`npm run build` compila el frontend. `npm start` compila y luego inicia el servidor. `npm run admin:crear` crea el usuario administrador indicado en el archivo de entorno.

## Publicación

GitHub Pages publica una versión estática del frontend con el workflow de `.github/workflows/deploy-pages.yml`. No se conecta al backend; las funciones que necesitan productos, inicio de sesión o base de datos requieren la publicación de Vercel.

Vercel publica el frontend y la API desde este mismo proyecto. El servidor necesita las variables de `backend/.env.example`, configuradas en Vercel; la base de datos debe estar disponible en MongoDB Atlas u otro servicio compatible.

El archivo real `backend/.env` es privado y está excluido de Git. No publiques allí claves dentro del frontend ni uses nombres `VITE_*` para secretos.
