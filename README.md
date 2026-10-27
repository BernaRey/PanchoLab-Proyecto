# Pancholab - El laboratorio del pancho

Aplicación full stack integrada (frontend + backend en un solo proyecto) con Node.js, Express, React, MongoDB y Mongoose.

## Tecnologías

- **Backend**: Node.js, Express, Mongoose, express-session, dotenv
- **Frontend**: React 18 (vía CDN, sin paso de compilación), HTML, CSS estándar
- **Base de datos**: MongoDB con Mongoose
- **Sin Vite, sin Webpack, sin TypeScript, sin Redux, sin Docker**

## Estructura del proyecto

```
pancholab-proyecto/
├── public/                 # Frontend (servido por Express)
│   ├── index.html
│   ├── css/
│   │   ├── variables.css
│   │   ├── global.css
│   │   ├── animaciones.css
│   │   ├── components.css
│   │   └── admin.css
│   └── js/
│       ├── main.js         # Enrutador cliente y punto de entrada
│       ├── components/     # Navbar, Footer, TarjetaProducto, etc.
│       ├── pages/          # Home, ProductoDetalle, Login, PanelAdmin
│       └── services/       # api.js (fetch a /api)
├── src/
│   └── server/
│       ├── config/
│       │   ├── env.js      # Variables de entorno
│       │   └── database.js # Conexión Mongoose
│       ├── models/
│       │   ├── Product.js  # ProductSchema
│       │   └── User.js     # Usuario (hash de contraseña, rol)
│       ├── controllers/
│       │   ├── productController.js
│       │   └── authController.js
│       ├── routes/
│       │   ├── products.js # /api/products
│       │   └── auth.js     # /api/auth
│       ├── middleware/
│       │   ├── auth.js     # autenticado + soloAdmin
│       │   ├── validate.js # validación de entrada
│       │   └── errorHandler.js
│       ├── app.js          # Express + sesiones + API + estático
│       └── server.js       # Punto de entrada
├── scripts/
│   └── setup-admin.js      # Crear el primer administrador
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Instalación y ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Luego edita `.env`. Al menos define:

- `MONGO_URI`: cadena de conexión a MongoDB (obligatoria para los datos).
- `SESSION_SECRETO`: clave aleatoria y privada de al menos 32 caracteres para firmar las sesiones; obligatoria en producción.
- `PUERTO`: puerto del servidor (por defecto 3000).
- `NODE_ENV`: entorno (`desarrollo` o `produccion`).
- `ADMIN_USERNAME` y `ADMIN_PASSWORD`: se usan solo al crear el primer administrador; la contraseña debe tener al menos 12 caracteres.
- `WHATSAPP_VENDEDOR`: número internacional del vendedor, con código de país y solo dígitos, por ejemplo `5491123456789`.

`.env` está excluido de Git (`.gitignore`).

### 3. Crear el primer administrador

El rol `admin` **no puede asignarse desde el navegador**. El primer administrador se crea mediante un script controlado:

```bash
# Completa ADMIN_USERNAME y ADMIN_PASSWORD en .env y ejecuta:
npm run admin:crear
```

El comando crea la cuenta solo si MongoDB está disponible y todavía no existe un administrador. No imprime ni guarda la contraseña en texto plano. Luego podrás iniciar sesión con ese usuario y acceder al panel de administración.

### 4. Iniciar la aplicación

Un único comando arranca todo (frontend servido por el backend + API):

```bash
npm start
```

O en modo desarrollo (con recarga automática):

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000` (o el puerto que definas en `PUERTO`).

## Rutas de la API (prefijo `/api`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/estado` | Público | Estado de la API y de la base de datos |
| POST | `/api/auth/login` | Público | Iniciar sesión (cookie `httpOnly`) |
| POST | `/api/auth/logout` | Sesión | Cerrar sesión |
| GET | `/api/auth/me` | Sesión | Usuario autenticado actual |
| POST | `/api/checkout` | Público | Validar stock, confirmar pedido y devolver enlace de WhatsApp |
| GET | `/api/products` | Público | Listar productos (`?category=...`) |
| GET | `/api/products/:id` | Público | Detalle de un producto |
| POST | `/api/products` | Admin | Crear producto |
| PUT | `/api/products/:id` | Admin | Actualizar producto |
| DELETE | `/api/products/:id` | Admin | Eliminar producto |

Las operaciones de escritura de productos están protegidas en el **backend**. Ocultar botones en el frontend no es suficiente.

## Roles

- No hay registro público: los clientes acceden directamente al catálogo.
- **admin**: puede crear, editar y eliminar productos desde el panel de administración. Se provisiona una única vez mediante `npm run admin:crear`.

El checkout descuenta el stock mediante actualizaciones condicionales por producto. Si un producto no tiene stock suficiente, revierte los descuentos anteriores; si la reversión falla, la API devuelve una referencia y registra los productos afectados sin guardar datos personales. Usá esa referencia en los logs y corregí el stock desde el panel admin. No se reintenta automáticamente una compensación ambigua porque un `$inc` podría haberse aplicado aunque se haya perdido la respuesta. Esta estrategia es compatible con MongoDB standalone, pero no tiene la atomicidad de una transacción ni recupera automáticamente una caída abrupta del proceso.

## Base de datos (MongoDB)

El esquema `Product` incluye: `name`, `description`, `price`, `stock`, `category`, `image`, `country`, `ingredients`, `isActive`, `createdAt`, `updatedAt`.

Si falta `MONGO_URI` o no se puede conectar a MongoDB, el servidor sigue sirviendo el frontend, pero las rutas de la API devuelven `503` con un mensaje claro indicando que la base de datos no está disponible. No aparenta funcionar cuando la base de datos no responde.

## Subir a GitHub

1. Crea un repositorio vacío en GitHub.
2. Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Versión inicial: Pancholab integrado (sin Vite)"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

3. Para ejecutarlo en otro entorno, clona el repositorio, ejecuta `npm install`, configura `.env` y `npm start`.

## Pruebas

```bash
npm test
```

Actualmente no hay pruebas automatizadas configuradas. El comando informa que no hay pruebas.
