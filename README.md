# PanchoLab

Sitio para un local de panchos y bebidas. Incluye catálogo, carrito, contacto por WhatsApp, acceso de administración y un asistente con Gemini.

## Carpetas

- `frontend/`: aplicación React, estilos y archivos públicos. Vite genera el sitio en `frontend/dist/`.
- `backend/`: API Express, conexión a MongoDB, modelos, rutas y script para crear el administrador.
- `api/`: entrada que usa Vercel para conectar las rutas `/api/*` con Express.
- `.github/workflows/`: publicación automática del sitio en GitHub Pages.

El proyecto usa un solo `package.json`, un solo `package-lock.json` y una instalación de dependencias en la raíz.

## Publicación

GitHub Pages publica una versión estática del frontend con el workflow de `.github/workflows/deploy-pages.yml`. No se conecta al backend; las funciones que necesitan productos, inicio de sesión o base de datos requieren la publicación de Vercel.

Vercel publica el frontend y la API desde este mismo proyecto. El servidor necesita las variables de `backend/.env.example`, configuradas en Vercel; la base de datos debe estar disponible en MongoDB Atlas u otro servicio compatible.

