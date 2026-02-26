import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../_guard";
import { slugify } from "@/lib/slug";
import { z } from "zod";

const Schema = z.object({ name: z.string().min(2) });

export async function GET(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return Response.json(cats);
}

export async function POST(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = Schema.parse(await req.json());
  const slug = slugify(body.name);

  const created = await prisma.category.create({ data: { name: body.name, slug } });
  return Response.json(created);
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  await prisma.category.delete({ where: { id } });
  return Response.json({ ok: true });
}
