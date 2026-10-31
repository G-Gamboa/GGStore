import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ChevronRight, ShoppingBag,
  Shirt, Sparkles, Footprints, Leaf, Star, Gift, Gem,
  Scissors, Layers, Tag, LayoutGrid, Glasses,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Categorías",
  description: "Explora todas las categorías de prendas disponibles en GGStore.",
};

type PaletteEntry = { bg: string; border: string; text: string; Icon: LucideIcon };

const PALETTE: PaletteEntry[] = [
  { bg: "#fce7f3", border: "#f9a8d4", text: "#9d174d", Icon: Shirt },
  { bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6", Icon: Sparkles },
  { bg: "#dbeafe", border: "#93c5fd", text: "#1d4ed8", Icon: Footprints },
  { bg: "#d1fae5", border: "#6ee7b7", text: "#065f46", Icon: Leaf },
  { bg: "#fef3c7", border: "#fcd34d", text: "#92400e", Icon: Star },
  { bg: "#ffedd5", border: "#fdba74", text: "#9a3412", Icon: Gift },
  { bg: "#cffafe", border: "#67e8f9", text: "#0e7490", Icon: Gem },
  { bg: "#f5f3ff", border: "#c4b5fd", text: "#6d28d9", Icon: ShoppingBag },
  { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", Icon: Scissors },
  { bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46", Icon: Layers },
  { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", Icon: Tag },
  { bg: "#f0f9ff", border: "#7dd3fc", text: "#075985", Icon: LayoutGrid },
  { bg: "#fdf4ff", border: "#e9d5ff", text: "#6b21a8", Icon: Glasses },
];

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
    <div className="space-y-8">

      {/* Header */}
      <section className="gg-hero">
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <ShoppingBag size={26} className="text-green-200" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white" style={{ letterSpacing: "-0.04em" }}>
                Categorías
              </h1>
              <p className="mt-1 text-sm text-green-200">
                {categories.length}{" "}
                {categories.length === 1 ? "categoría disponible" : "categorías disponibles"} ·
                Explora toda la colección
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de categorías */}
      {categories.length === 0 ? (
        <div className="gg-surface p-12 flex flex-col items-center gap-4 text-center">
          <ShoppingBag size={44} className="text-neutral-300" />
          <div className="font-semibold">Sin categorías aún</div>
          <Link href="/" className="text-sm underline text-neutral-500">
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const palette = PALETTE[i % PALETTE.length];
            const available = c._count.products;
            return (
              <Link key={c.id} href={`/c/${c.slug}`} className="group">
                <div
                  className="gg-cat-card"
                  style={{
                    background: palette.bg,
                    borderColor: palette.border,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: "rgba(255,255,255,0.7)" }}
                  >
                    <palette.Icon size={26} style={{ color: palette.text }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-bold text-base truncate"
                      style={{ color: palette.text }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="text-sm mt-0.5"
                      style={{ color: palette.text, opacity: 0.65 }}
                    >
                      {available === 0
                        ? "Sin disponibles ahora"
                        : `${available} ${available === 1 ? "prenda disponible" : "prendas disponibles"}`}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={20}
                    className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: palette.text, opacity: 0.45 }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
