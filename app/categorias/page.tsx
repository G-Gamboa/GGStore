import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LayoutGrid, ChevronRight, Package } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Categorías",
  description: "Explora todas las categorías de prendas disponibles en GGStore.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          products: { where: { isActive: true, status: "AVAILABLE" } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="gg-section p-8">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "var(--gg-primary)" }}
          >
            <LayoutGrid size={22} className="text-[var(--gg-dark)]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--gg-dark)]">Categorías</h1>
            <p className="text-sm text-[color:var(--gg-muted)]">
              {categories.length} {categories.length === 1 ? "categoría" : "categorías"} disponibles
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      {categories.length === 0 ? (
        <div className="gg-surface p-10 flex flex-col items-center gap-3 text-center">
          <Package size={40} className="text-neutral-300" />
          <div className="font-semibold">Sin categorías aún</div>
          <Link href="/" className="text-sm underline text-neutral-500">
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="group">
              <div className="gg-surface p-5 flex items-center justify-between gap-3 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.name}</div>
                  <div className="text-sm text-neutral-500 mt-0.5">
                    {c._count.products === 0
                      ? "Sin disponibles"
                      : `${c._count.products} ${c._count.products === 1 ? "disponible" : "disponibles"}`}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-neutral-300 group-hover:text-[var(--gg-dark)] transition-colors"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
