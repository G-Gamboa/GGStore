import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/product-grid";
import { ArrowLeft, Package } from "lucide-react";

export const revalidate = 60;

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

  return { title, description, openGraph: { title, description } };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    return (
      <div className="gg-surface p-12 text-center space-y-3">
        <Package size={44} className="mx-auto text-neutral-300" />
        <div className="font-semibold">Categoría no encontrada</div>
        <Link href="/categorias" className="gg-button gg-button-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Ver categorías
        </Link>
      </div>
    );
  }

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

  const available = products.filter((p) => p.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="gg-hero">
        <div className="relative z-10 p-7 md:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/categorias"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--gg-muted)] hover:text-[var(--gg-dark)] transition-colors mb-3"
              >
                <ArrowLeft size={13} /> Todas las categorías
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gg-dark)]">
                {category.name}
              </h1>
              <p className="mt-1.5 text-sm text-[color:var(--gg-muted)]">
                {available > 0
                  ? `${available} ${available === 1 ? "prenda disponible" : "prendas disponibles"}`
                  : "Sin prendas disponibles ahora mismo"}
              </p>
            </div>

            <div className="gg-stat-box self-start sm:self-auto">
              <div className="text-3xl font-extrabold tracking-tight text-[var(--gg-dark)]">
                {products.length}
              </div>
              <div className="text-xs font-medium text-[color:var(--gg-muted)] mt-0.5">
                {showSold ? "En catálogo" : "Disponibles"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de productos */}
      {products.length === 0 ? (
        <div className="gg-surface p-12 flex flex-col items-center gap-4 text-center">
          <Package size={44} className="text-neutral-300" />
          <div>
            <div className="font-semibold">Sin productos en esta categoría</div>
            <div className="mt-1 text-sm text-neutral-500">
              Vuelve pronto, actualizamos el catálogo frecuentemente.
            </div>
          </div>
          <Link href="/" className="gg-button gg-button-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Ver catálogo completo
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} showStatus={showSold} />
      )}
    </div>
  );
}
