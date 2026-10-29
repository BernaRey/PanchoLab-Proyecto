# PanchoLab

PanchoLab es un laboratorio cultural de panchos: un catálogo conectado a MongoDB, compras por WhatsApp, acceso privado de administración y un asistente de recomendaciones basado en Gemini.

## Estructura

```text
src/
  App.jsx                 rutas y estado general de la aplicación
  components/             navegación, catálogo, carrito y asistente
  contextos/              estado compartido del carrito
  pages/                  inicio, detalle, login y administración
  services/api.js          cliente único para la API
  estilos/                tema, layout y estilos por experiencia
  server/
    config/                variables de entorno y MongoDB
    controllers/           reglas de entrada y respuestas de API
    middleware/            autenticación, validación y errores
    models/                modelos Mongoose
    routes/                rutas Express por función
public/                    recursos estáticos y fallback histórico de Express
dist/                      build de Vite (generado; no se versiona)
```

`src/` es la fuente actual de React. `public/js/` conserva el frontend anterior como fallback histórico; no se usa para nuevas pantallas. `npm start` compila `src/` antes de iniciar Express y sirve `dist/`.

## Desarrollo local

1. Instala Node.js 20 o superior y MongoDB.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env` y completa `MONGO_URI`, `SESSION_SECRETO` y `WHATSAPP_VENDEDOR`.
4. Para recomendaciones, crea una clave de Google AI Studio y configura `GEMINI_API_KEY`. La clave se lee solo en el servidor.
5. Crea el administrador inicial con `npm run admin:crear`.
6. En terminales separadas, ejecuta `npm run dev:server` y `npm run dev`.

Para servir el build desde Express usa `npm start`. `npm run start:api` inicia Express directamente y se utiliza para alojar la API por separado.

## Variables

| Variable | Uso |
| --- | --- |
| `MONGO_URI` | Conexión a MongoDB. |
| `SESSION_SECRETO` | Secreto aleatorio de sesión de 32 caracteres o más. |
| `WHATSAPP_VENDEDOR` | Número internacional con código de país y solo dígitos. |
| `GEMINI_API_KEY` | Clave privada de Gemini, solo en el host de la API. |
| `GEMINI_MODEL` | Modelo del asistente; por defecto `gemini-2.5-flash-lite`. |
| `CORS_ORIGINS` | Orígenes exactos permitidos en producción, separados por coma; por ejemplo `https://usuario.github.io`. En desarrollo se permite localhost automáticamente. |
| `SESSION_COOKIE_SAME_SITE` | `lax` para mismo sitio local, `none` en despliegue separado con HTTPS. |
| `VITE_API_URL` | URL pública de Express, sin barra final. Vacía en desarrollo con proxy Vite. |
| `VITE_BASE_PATH` | Prefijo del sitio; `/` local y `/<repositorio>/` en GitHub Pages. |

No pongas `GEMINI_API_KEY` ni otros secretos en variables `VITE_*`: Vite las incorpora al frontend público.

## API existente y agregada

Las rutas existentes de autenticación, productos, tienda y checkout mantienen sus contratos. Se agregan:

| Método | Ruta | Función |
| --- | --- | --- |
| `POST` | `/api/contacto` | Valida el formulario y devuelve un enlace `wa.me` con el mensaje preparado. |
| `POST` | `/api/ia/recomendar` | Recomienda recetas activas usando catálogo real y Gemini. |

El asistente limita los mensajes a 500 caracteres, el historial a seis intercambios y aplica un límite básico de 12 consultas por minuto por IP. Si no hay clave, cuota o conexión disponible, devuelve un error legible. El plan gratuito de Gemini tiene modelos y cuotas limitados que Google puede cambiar; la app usa el modelo configurado y no habilita facturación por sí misma.

## GitHub Pages y API separada

El workflow `.github/workflows/deploy-pages.yml` compila y publica `dist/` en cada push a `main`. En el repositorio, selecciona **Settings → Pages → GitHub Actions** y crea la variable `PANCHOLAB_API_URL` con la URL HTTPS de la API.

En el host de Express configura:

- `NODE_ENV=production`
- `MONGO_URI`, `SESSION_SECRETO`, `WHATSAPP_VENDEDOR` y `GEMINI_API_KEY`
- `CORS_ORIGINS` con el origen del sitio de Pages, sin la ruta del repositorio
- `SESSION_COOKIE_SAME_SITE=none` para permitir la cookie entre Pages y la API

La cookie es `httpOnly`, `Secure` en producción y se envía con credenciales. CORS no acepta comodines. Los navegadores que bloquean cookies de terceros pueden impedir el login si Pages y la API pertenecen a sitios distintos; para una publicación final hay que probar el navegador objetivo o usar un dominio propio compartido por frontend y API.

Las claves gratuitas de Gemini tienen cuotas y disponibilidad sujetas a la cuenta, modelo y condiciones vigentes. La app no configura una cuenta de facturación ni selecciona una ruta pagada automáticamente.

### Si la base de datos aparece desconectada

`/api/estado` muestra una explicación sin exponer la URI. Si usas MongoDB Atlas y aparece el error de IP, abre **Security → Network Access → Add IP Address** en Atlas y autoriza la IP actual de tu equipo. Verifica también que el cluster esté activo. No es necesario abrir el acceso a todas las IP. El login y el catálogo dependen de que MongoDB acepte la conexión.

## Entrega

- La interfaz se publica en GitHub Pages y la API necesita un host Node.js/MongoDB configurado por separado.
- GitHub Pages no aloja Express ni MongoDB.
- Usa commits pequeños que agrupen cambios funcionales. El proyecto requiere al menos 15 commits en el repositorio.
- `npm run build` valida el build estático de Vite.
