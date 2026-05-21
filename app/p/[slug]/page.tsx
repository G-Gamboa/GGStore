import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AddToCart from "./ui";
import { formatQ } from "@/lib/money";
import { cldImg } from "@/lib/cloudinary";
import { Tag, Ruler, Palette, Shirt, Star, ArrowLeft } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug }, include: { category: true } });

  if (!p) return { title: "Producto no encontrado" };

  const title = p.name;
  const price = formatQ(p.priceQ);
  const chips = [p.brand, p.size, p.color, p.gender].filter(Boolean).join(" · ");
  const description = [price, chips, p.description?.slice(0, 120)].filter(Boolean).join(" · ");
  const imageUrl = p.imageUrl ? cldImg(p.imageUrl, { w: 1200 }) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 1200, alt: title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const p = await prisma.product.findUnique({ where: { slug }, include: { category: true } });

  if (!p) {
    return (
      <div className="gg-surface p-12 text-center space-y-3">
        <div className="text-4xl">🔍</div>
        <div className="text-lg font-semibold">Producto no encontrado</div>
        <Link href="/" className="gg-button gg-button-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Ver catálogo
        </Link>
      </div>
    );
  }

  const settings = await prisma.settings.findFirst();
  const showSold = settings?.showSoldPublic ?? false;

  if (p.status === "RESERVED" || (!showSold && p.status === "SOLD")) {
    return (
      <div className="gg-surface p-12 text-center space-y-3">
        <div className="text-4xl">😔</div>
        <div className="text-lg font-semibold">Producto no disponible</div>
        <Link href="/" className="gg-button gg-button-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Ver catálogo
        </Link>
      </div>
    );
  }

  const img = p.imageUrl
    ? cldImg(p.imageUrl, { w: 1200 })
    : "https://placehold.co/1200x1200/f0fdf4/14532d?text=GGStore";

  return (
    <div className="space-y-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[color:var(--gg-muted)] hover:text-[var(--gg-dark)] transition-colors"
        >
          <ArrowLeft size={14} /> Catálogo
        </Link>
        <span className="text-neutral-300">/</span>
        <Link
          href={`/c/${p.category.slug}`}
          className="text-[color:var(--gg-muted)] hover:text-[var(--gg-dark)] transition-colors"
        >
          {p.category.name}
        </Link>
      </div>

      {/* Card principal */}
      <div className="gg-surface p-5 md:p-8">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Imagen */}
          <div
            className="overflow-hidden rounded-3xl"
            style={{ border: "1px solid var(--gg-border-soft)" }}
          >
            <div className="relative aspect-square bg-[var(--gg-bg)]">
              <Image
                src={img}
                alt={p.name}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">

            {/* Categoría + nombre + precio */}
            <div>
              <Link
                href={`/c/${p.category.slug}`}
                className="text-xs font-semibold uppercase tracking-widest text-[color:var(--gg-muted)] hover:text-[var(--gg-dark)] transition-colors"
              >
                {p.category.name}
              </Link>
              <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-neutral-900">
                {p.name}
              </h1>

              {/* Precio destacado */}
              <div className="mt-3 inline-flex items-baseline gap-2">
                <span
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: "var(--gg-dark)" }}
                >
                  {formatQ(p.priceQ)}
                </span>
                {p.condition !== null && (
                  <span className="gg-badge gg-badge-available text-xs">
                    <Star size={11} fill="currentColor" /> Estado {p.condition}/10
                  </span>
                )}
              </div>
            </div>

            {/* Chips de atributos */}
            <div className="flex flex-wrap gap-2">
              {p.brand && (
                <span className="gg-chip inline-flex items-center gap-1.5 text-sm px-3 py-1">
                  <Tag size={13} /> {p.brand}
                </span>
              )}
              {p.size && (
                <span className="gg-chip inline-flex items-center gap-1.5 text-sm px-3 py-1">
                  <Ruler size={13} /> {p.size}
                </span>
              )}
              {p.color && (
                <span className="gg-chip inline-flex items-center gap-1.5 text-sm px-3 py-1">
                  <Palette size={13} /> {p.color}
                </span>
              )}
              {p.gender && (
                <span className="gg-chip inline-flex items-center gap-1.5 text-sm px-3 py-1">
                  <Shirt size={13} /> {p.gender}
                </span>
              )}
            </div>

            {/* Descripción */}
            {p.description && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "var(--gg-secondary)", border: "1px solid var(--gg-border-soft)" }}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--gg-muted)] mb-2">
                  Descripción
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {p.description}
                </p>
              </div>
            )}

            {/* CTA */}
            {p.status === "AVAILABLE" ? (
              <AddToCart
                product={{
                  id: p.id,
                  name: p.name,
                  priceQ: p.priceQ,
                  slug: p.slug,
                  imageUrl: p.imageUrl || null,
                  externalId: p.externalId,
                }}
              />
            ) : (
              <div
                className="rounded-2xl p-4 text-sm text-neutral-600"
                style={{ background: "var(--gg-bg)", border: "1px solid var(--gg-border-soft)" }}
              >
                Este producto ya no está disponible.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
