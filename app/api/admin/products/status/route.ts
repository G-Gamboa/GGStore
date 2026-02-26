import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../../_guard";
import { z } from "zod";

const Schema = z.object({
  id: z.string().min(1),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]),
});

export async function POST(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const data = Schema.parse(await req.json());
  const soldAt = data.status === "SOLD" ? new Date() : null;

  const updated = await prisma.product.update({
    where: { id: data.id },
    data: { status: data.status, soldAt },
  });

  return Response.json(updated);
}
