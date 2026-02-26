import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

type Row = {
  Id: string;
  Nombre: string;
  Descripcion?: string;
  Precio: string;
  Categoria: string;
  Marca?: string;
  Talla?: string;
  Color?: string;
  EstadoPrenda?: string;
  Estado?: string;         // Disponible / Vendido
  ImagenUrl?: string;      // URL
  FechaCreacion?: string;  // "1/10/2025 09:41" (según tu export)
  FechaVenta?: string;
  Genero?: string;
};

function pickFile() {
  const tsv = path.join(process.cwd(), "data", "products.tsv");
  const csv = path.join(process.cwd(), "data", "products.csv");
  const plantilla = path.join(process.cwd(), "data", "plantilla_productos.csv");

  if (fs.existsSync(tsv)) return { file: tsv, delimiter: "\t", encoding: "utf-8" as const };
  if (fs.existsSync(csv)) return { file: csv, delimiter: ",", encoding: "utf-8" as const };
  if (fs.existsSync(plantilla)) return { file: plantilla, delimiter: ";", encoding: "latin1" as const };

  throw new Error(
    "Pon tu archivo en: data/products.tsv (tab), data/products.csv (coma) o data/plantilla_productos.csv (;)."
  );
}

function toInt(s: string) {
  const n = Number(String(s ?? "").trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function norm(s?: string | null) {
  const t = String(s ?? "").trim();
  return t.length ? t : null;
}

// Intenta parsear "1/10/2025 09:41" (M/D/YYYY HH:mm) y variantes.
// Si falla, devuelve null.
function parseDate(input?: string | null) {
  const t = String(input ?? "").trim();
  if (!t) return null;

  // Accept "M/D/YYYY HH:mm" or "M/D/YYYY" (US-like) from your exports
  const m = t.match(/^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})(?:\s+([0-9]{1,2}):([0-9]{2}))?$/);
  if (m) {
    const month = Number(m[1]);
    const day = Number(m[2]);
    const year = Number(m[3]);
    const hh = m[4] ? Number(m[4]) : 0;
    const mm = m[5] ? Number(m[5]) : 0;
    const d = new Date(Date.UTC(year, month - 1, day, hh, mm));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function ensureCategory(name: string) {
  const slug = slugify(name);
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
}

async function uniqueProductSlug(base: string) {
  let candidate = base;
  for (let i = 0; i < 50; i++) {
    const exists = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    candidate = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

async function main() {
  const { file, delimiter, encoding } = pickFile();
  const raw = fs.readFileSync(file, encoding);

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    delimiter,
  }) as Row[];

  console.log(`Importando ${records.length} filas desde ${path.basename(file)}...`);

  for (const r of records) {
    if (!r.Nombre || !r.Categoria || !r.Precio) continue;

    const cat = await ensureCategory(r.Categoria);

    const externalId = toInt(r.Id);
    const priceQ = toInt(r.Precio) ?? 0;
    const condition = r.EstadoPrenda ? toInt(r.EstadoPrenda) : null;

    const baseSlug = slugify(r.Nombre);
    const slug = await uniqueProductSlug(baseSlug);

    const estado = (r.Estado || "").trim().toLowerCase();
    const isSold = estado === "vendido" || !!parseDate(r.FechaVenta);
    const isReserved = estado === "reservado";

    const createdAt = parseDate(r.FechaCreacion);
    const soldAt = isSold ? (parseDate(r.FechaVenta) ?? new Date()) : null;

    await prisma.product.create({
      data: {
        externalId: externalId ?? undefined,
        name: r.Nombre,
        slug,
        priceQ,
        categoryId: cat.id,
        brand: norm(r.Marca),
        size: norm(r.Talla),
        color: norm(r.Color),
        condition: condition ?? null,
        gender: norm(r.Genero),
        imageUrl: norm(r.ImagenUrl),
        description: norm(r.Descripcion),
        status: isSold ? "SOLD" : (isReserved ? "RESERVED" : "AVAILABLE"),
        isActive: true,
        ...(createdAt ? { createdAt } : {}),
        ...(soldAt ? { soldAt } : {}),
      },
    });
  }

  console.log("Import completo.");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
