import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../_guard";
import { slugify } from "@/lib/slug";
import { z } from "zod";

const Schema = z.object({
  id: z.string().optional(),
  externalId: z.number().int(),
  name: z.string().min(2),
  priceQ: z.number().int().min(0),
  categoryId: z.string().min(1),
  brand: z.string().nullable(),
  size: z.string().nullable(),
  color: z.string().nullable(),
  condition: z.number().int().min(1).max(10).nullable(),
  gender: z.string().nullable(),  isActive: z.boolean(),
});

async function uniqueSlug(base: string) {
  let candidate = base;
  for (let i = 0; i < 50; i++) {
    const exists = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    candidate = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const data = Schema.parse(await req.json());
  const baseSlug = slugify(data.name);
  const imageUrl = `P_${data.externalId}`;

  if (data.id) {
    const updated = await prisma.product.update({
      where: { id: data.id },
      data: {
        externalId: data.externalId ?? undefined,
        name: data.name,
        priceQ: data.priceQ,
        categoryId: data.categoryId,
        brand: data.brand,
        size: data.size,
        color: data.color,
        condition: data.condition,
        gender: data.gender,
      imageUrl,
        isActive: data.isActive,
      },
    });
    return Response.json(updated);
  }

  const slug = await uniqueSlug(baseSlug);

  const created = await prisma.product.create({
    data: {
      externalId: data.externalId ?? undefined,
      name: data.name,
      slug,
      priceQ: data.priceQ,
      categoryId: data.categoryId,
      brand: data.brand,
      size: data.size,
      color: data.color,
      condition: data.condition,
      gender: data.gender,
      imageUrl,
      isActive: data.isActive,
    },
  });

  return Response.json(created);
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}
