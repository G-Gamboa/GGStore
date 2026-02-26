import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../_guard";
import { z } from "zod";

const Schema = z.object({
  showSoldPublic: z.boolean(),
  trackStock: z.boolean(),
});

export async function POST(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const data = Schema.parse(body);

  const s = await prisma.settings.findFirst();
  const settings = s
    ? await prisma.settings.update({ where: { id: s.id }, data })
    : await prisma.settings.create({ data });

  return Response.json(settings);
}
