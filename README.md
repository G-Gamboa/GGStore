# GGStore

Tienda de ropa de segunda mano (paca) construida con Next.js, Prisma y PostgreSQL.

Los clientes navegan el catálogo, agregan al carrito y envían su pedido por WhatsApp — sin pasarela de pago. El administrador gestiona productos, categorías y estados desde un panel privado, y puede actualizar estados vía bot de Telegram.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| ORM / DB | Prisma + PostgreSQL 16 |
| Estilos | TailwindCSS |
| Imágenes | Cloudinary |
| Auth | Sesión por cookie HttpOnly + bcrypt |
| Animaciones | Framer Motion |

## Funcionalidades

**Catálogo público**
- Filtros por nombre, categoría, marca, talla, color, género, estado y precio
- Paginación (24 productos por página)
- Carrito persistido en localStorage → checkout por WhatsApp

**Panel de administración** (`/admin`)
- Login con email y contraseña
- CRUD de productos y categorías
- Importación masiva de productos desde CSV/TSV
- Dashboard: stock disponible, vendidos, ingresos por mes
- Toggle para mostrar/ocultar vendidos en el catálogo público

**Bot de Telegram** (opcional)
- Buscar producto por ID externo: `/p 22`
- Ver y cambiar estado con botones inline: `/estado 22`

## Requisitos previos

- Node.js v20.19+
- Docker (para PostgreSQL local)
- Cuenta de Cloudinary (para imágenes)

## Arranque local

```bash
# 1. Variables de entorno
cp .env.example .env
# Edita .env con tus valores reales

# 2. Base de datos
docker compose up -d

# 3. Dependencias
npm install

# 4. Migraciones y seed inicial
npx prisma migrate dev --name init
npm run db:seed

# 5. Servidor de desarrollo
npm run dev
```

- Catálogo: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## Variables de entorno

Copia `.env.example` a `.env` y completa cada valor:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `DIRECT_URL` | Conexión directa (requerida con pooling en producción) |
| `WHATSAPP_NUMBER` | Número con código de país, sin `+` (ej. `502XXXXXXXXX`) |
| `WHATSAPP_BASE_MESSAGE` | Mensaje inicial del pedido por WhatsApp |
| `SESSION_DAYS` | Duración de la sesión admin en días (default: 30) |
| `COOKIE_NAME` | Nombre de la cookie de sesión |
| `ADMIN_SEED_EMAIL` | Email del usuario admin creado al sembrar |
| `ADMIN_SEED_PASSWORD` | Contraseña del admin (usar una fuerte en producción) |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary (servidor) |
| `CLOUDINARY_FOLDER` | Carpeta dentro del cloud (servidor) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name (cliente, preview en admin) |
| `NEXT_PUBLIC_CLOUDINARY_FOLDER` | Carpeta (cliente, preview en admin) |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram (opcional) |
| `TELEGRAM_ALLOWED_USER_ID` | Telegram user ID autorizado a usar el bot |
| `TELEGRAM_WEBHOOK_SECRET` | Secret para validar los webhooks de Telegram |

## Credenciales admin por defecto

```
Email:    admin@ggstore.local
Password: Admin123!
```

Cambia estos valores en `.env` antes de correr `npm run db:seed`. Para actualizar las credenciales en una BD existente, borra la fila del usuario en la tabla `User` y corre el seed nuevamente.

## Importación de productos

Desde el panel admin en **Importar**, o por consola:

```bash
npm run import:products
```

Formato del archivo (CSV o TSV):

```
Id,Nombre,Precio,Categoria,Marca,Talla,Color,EstadoPrenda,Genero
22,Licra azul,80,Licras,RBX,L,Azul,10,Mujer
```

- Si la columna `Estado` tiene el valor `Vendido`, el producto se crea como `SOLD` con `soldAt = now()`.
- `FechaCreacion` y `FechaVenta` son opcionales.
- Hay una plantilla en [`docs/plantilla_productos.csv`](docs/plantilla_productos.csv).

## Imágenes (Cloudinary)

La app guarda en base de datos solo el `public_id` del archivo, por ejemplo `P_22`. La URL se construye automáticamente al vuelo con transformaciones `f_auto,q_auto`.

Para subir una imagen al producto con ID externo `22`, sube el archivo a Cloudinary con el public ID `ggstore/P_22` (o la carpeta que hayas configurado).

## Despliegue en producción

Configuración recomendada económica:

| Servicio | Proveedor |
|---|---|
| Hosting | Vercel |
| Base de datos | Neon (PostgreSQL serverless) |
| Imágenes | Cloudinary |

En Neon, usa `DATABASE_URL` con el connection pooler y `DIRECT_URL` con la conexión directa (necesario para las migraciones de Prisma).

```bash
# Correr migraciones en producción
npx prisma migrate deploy
npm run db:seed
```

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run db:seed      # Sembrar usuario admin y datos iniciales
npm run import:products  # Importar productos desde CSV/TSV
```
