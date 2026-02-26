import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../_guard";

export async function GET(req: NextRequest) {
  const user = await requireAdminApi(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return Response.json({ categories, products });
}
