import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/product-grid";
import { PillLink } from "@/components/ui";

export const revalidate = 60; // ISR: regenera cada 60 s en segundo plano

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: "Categoría no encontrada" };

  const title = category.name;
  const description = `Explora ${title} en GGStore. Prendas únicas de segunda mano seleccionadas a los mejores precios.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return <div>No existe la categoría.</div>;

  const settings = await prisma.settings.findFirst();
  const showSold = settings?.showSoldPublic ?? false;

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
      ...(showSold
        ? { status: { in: ["AVAILABLE", "SOLD"], not: "RESERVED" } }
        : { status: "AVAILABLE" }),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <p className="text-neutral-600">{products.length} productos</p>
        </div>
        <PillLink href="/categorias">Volver a categorías</PillLink>
      </div>
      
      <ProductGrid products={products} showStatus={showSold} />
    </div>
  );
}
