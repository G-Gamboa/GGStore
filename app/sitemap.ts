import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, status: { not: "RESERVED" } },
      select: { slug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/categorias`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/c/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/p/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
