# GGStore (Next.js + Prisma + PostgreSQL) - Custom Paca Shop

Custom (100% tuyo) catálogo minimalista de prendas de paca:
- Catálogo público con filtros
- Carrito -> WhatsApp (sin pago en línea)
- Admin con login (email + password) y sesión por cookie
- CRUD productos / categorías
- Marcar producto como VENDIDO (solo inventario, sin datos de cliente)
- Dashboard simple: disponibles/vendidos, ventas por mes (conteo), total vendido (Q)

## Stack
- Next.js (App Router) + TypeScript
- Prisma ORM
- PostgreSQL
- TailwindCSS

## Requisitos
- Node.js v20+ (recomendado LTS actual)
- Docker (para Postgres local)

## Arranque local
1) Copia variables:
```bash
cp .env.example .env
```

2) Levanta Postgres:
```bash
docker compose up -d
```

3) Instala deps:
```bash
npm install
```

4) Migra y siembra:
```bash
npx prisma migrate dev --name init
npm run db:seed
```

5) Corre:
```bash
npm run dev
```

Abre:
- http://localhost:3000 (catálogo)
- http://localhost:3000/admin/login (admin)

## Credenciales admin (seed)
Por defecto:
- Email: admin@ggstore.local
- Password: Admin123!

Puedes cambiarlo en `.env` (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD) y volver a correr `npm run db:seed`.

## CSV/TSV import
Soportamos 3 formatos (auto-detect):
1) `data/products.tsv` (tab)
2) `data/products.csv` (coma)
3) `data/plantilla_productos.csv` (punto y coma `;`, normalmente en **Latin-1**)

Encabezados soportados (los de tu proyecto .NET):
`Id,Nombre,Descripcion,Precio,Categoria,Marca,Talla,Color,EstadoPrenda,Estado,ImagenUrl,FechaCreacion,FechaVenta,Genero`

Luego:
```bash
npm run import:products
```

Notas:
- `Estado` = `Disponible` / `Vendido` (si viene Vendido se marca SOLD y se setea `soldAt`)
- `FechaCreacion` y `FechaVenta` se intentan parsear (si no, se usa `now()`)

## Imágenes (URLs)
Por ahora guardamos `imageUrl` como URL.
Si luego usas Cloudinary, pon el URL transformado (ej: f_auto,q_auto,w_1000,c_limit) en el mismo campo.

## Notas de producción
- En VPS barato: Docker + Nginx + SSL (Let's Encrypt)
- Respaldo DB: `pg_dump` diario + snapshot semanal


### Estado de inventario
- AVAILABLE = Disponible
- RESERVED = Reservado (nunca se muestra públicamente)
- SOLD = Vendido


## Importar productos (Admin)
En Admin existe la pantalla **Importar** para subir CSV/TSV sin usar consola.
- Modo **Skip**: no inserta si ya existe el Id (externalId)
- Modo **Upsert**: actualiza si ya existe el Id

## Carrito (prenda única)
El carrito no permite cantidades > 1 por producto.


## UI (v7)
Esta versión usa `lucide-react` para íconos y `framer-motion` para animaciones.

## Prisma
Por compatibilidad, fijamos Prisma en 6.19.2 (Node 20.19+).
