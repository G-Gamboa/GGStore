import { NextRequest } from "next/server";
import { requireAdminApi } from "../_guard";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { slugify } from "@/lib/slug";

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
  Estado?: string;         // Disponible / Vendido / Reservado  Genero?: string;
};

function norm(s?: string | null) {
  const t = String(s ?? "").trim();
  return t.length ? t : null;
}

function toInt(s: string) {
  const n = Number(String(s ?? "").trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
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

function detectDelimiter(text: string) {
  const head = text.split(/\r?\n/)[0] || "";
  if (head.includes("\t")) return "\t";
  if (head.includes(";")) return ";";
  return ",";
}

function decodeBytes(buf: ArrayBuffer) {
  const b = Buffer.from(buf);
  const utf8 = b.toString("utf8");
  const repl = (utf8.match(/\uFFFD/g) || []).length;
  if (repl > 0) return b.toString("latin1");
  return utf8;
}

export async function POST(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const mode = String(form.get("mode") || "skip"); // skip | upsert

  if (!(file instanceof File)) return new Response("Falta archivo", { status: 400 });

  const ab = await file.arrayBuffer();
  const text = decodeBytes(ab);
  const delimiter = detectDelimiter(text);

  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    delimiter,
  }) as Row[];

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const r of records) {
    try {
      if (!r.Nombre || !r.Categoria || !r.Precio) { skipped++; continue; }

      const cat = await ensureCategory(r.Categoria);

      const externalId = toInt(r.Id);
      const imageUrl = externalId ? `P_${externalId}` : null;
      const priceQ = toInt(r.Precio) ?? 0;
      const condition = r.EstadoPrenda ? toInt(r.EstadoPrenda) : null;

      const estado = (r.Estado || "").trim().toLowerCase();
      const isSold = estado === "vendido";
      const isReserved = estado === "reservado";

      const soldAt = isSold ? new Date() : null;

      const baseSlug = slugify(r.Nombre);
      const slug = await uniqueProductSlug(baseSlug);

      if (externalId && mode === "skip") {
        const exists = await prisma.product.findUnique({ where: { externalId } });
        if (exists) { skipped++; continue; }
      }

      if (externalId && mode === "upsert") {
        const existing = await prisma.product.findUnique({ where: { externalId } });
        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: r.Nombre,
              priceQ,
              categoryId: cat.id,
              brand: norm(r.Marca),
              size: norm(r.Talla),
              color: norm(r.Color),
              condition: condition ?? null,
              gender: norm(r.Genero),
              imageUrl,
              description: norm(r.Descripcion),
              status: isSold ? "SOLD" : (isReserved ? "RESERVED" : "AVAILABLE"),              soldAt,
            },
          });
          updated++;
          continue;
        }
      }

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
          imageUrl,
          description: norm(r.Descripcion),
          status: isSold ? "SOLD" : (isReserved ? "RESERVED" : "AVAILABLE"),
          isActive: true,          ...(soldAt ? { soldAt } : {}),
        },
      });
      created++;
    } catch {
      errors++;
    }
  }

  return new Response(
    `Import OK\nCreado: ${created}\nActualizado: ${updated}\nSaltado: ${skipped}\nErrores: ${errors}`,
    { status: 200 }
  );
}
