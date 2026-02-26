# GGStore (Next.js + Prisma + PostgreSQL)

Tienda custom para prendas de paca: - Catálogo público con
filtros - Carrito -\> WhatsApp (sin pago en línea) - Admin con login
(email + password) y sesión por cookie - CRUD productos / categorías -
Marcar producto como VENDIDO -
Dashboard simple: disponibles/vendidos, ventas por mes (conteo), total
vendido (Q)

------------------------------------------------------------------------

## Stack

-   Next.js (App Router) + TypeScript
-   Prisma ORM
-   PostgreSQL
-   TailwindCSS
-   Cloudinary (imágenes)

------------------------------------------------------------------------

## Requisitos

-   Node.js v20.19+ (recomendado)
-   Docker (para Postgres local)

------------------------------------------------------------------------

## Arranque local

1)  Copia variables:

``` bash
cp .env.example .env
```

2)  Levanta Postgres:

``` bash
docker compose up -d
```

3)  Instala dependencias:

``` bash
npm install
```

4)  Migra y siembra:

``` bash
npx prisma migrate dev --name init
npm run db:seed
```

5)  Corre el proyecto:

``` bash
npm run dev
```

Abre: - http://localhost:3000 (catálogo) -
http://localhost:3000/admin/login (admin)

------------------------------------------------------------------------

## Credenciales admin (seed)

Por defecto: - Email: admin@ggstore.local - Password: Admin123!

Cámbialo en `.env` (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD) y vuelve a
correr:

``` bash
npm run db:seed
```

------------------------------------------------------------------------

## Import (CSV/TSV)

Puedes importar desde Admin (**Importar**) o por consola:

``` bash
npm run import:products
```

Encabezados base soportados:

Id,Nombre,Precio,Categoria,Marca,Talla,Color,EstadoPrenda,Genero

Notas: - Si `Estado` viene como `Vendido`, se marca SOLD y se setea
`soldAt = now()` para el dashboard. - `FechaCreacion` y `FechaVenta` no
son requeridas.

------------------------------------------------------------------------

## Imágenes (Cloudinary)

La app guarda en BD solo el `public_id`, por ejemplo: `P_22`.

Se construye la URL usando: - Cloud: dk7aiheee - Folder: ggstore

------------------------------------------------------------------------

## Producción (opción barata recomendada)

Hosting: Vercel\
Base de datos: Neon (Postgres)\
Imágenes: Cloudinary

Variables necesarias en Vercel:

-   DATABASE_URL (Neon)
-   CLOUDINARY_CLOUD_NAME=dk7aiheee
-   CLOUDINARY_FOLDER=ggstore
-   WHATSAPP_NUMBER=...
-   ADMIN_SEED_EMAIL
-   ADMIN_SEED_PASSWORD (usar password fuerte)

------------------------------------------------------------------------

Proyecto listo para escalar cuando quieras integrar pagos en línea.
