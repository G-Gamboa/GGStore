import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AddToCart from "./ui";
import { formatQ } from "@/lib/money";
import { cldImg } from "@/lib/cloudinary";
import { PillLink } from "@/components/ui";
import { Tag, Ruler, Palette, Shirt } from "lucide-react";

export const revalidate = 60; // ISR: regenera cada 60 s en segundo plano

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!p) return { title: "Producto no encontrado" };

  const title = p.name;
  const price = formatQ(p.priceQ);
  const chips = [p.brand, p.size, p.color, p.gender].filter(Boolean).join(" · ");
  const description = [
    price,
    chips,
    p.description ? p.description.slice(0, 120) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const imageUrl = p.imageUrl ? cldImg(p.imageUrl, { w: 1200 }) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 1200, alt: title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!p) return <div>Producto no encontrado.</div>;

  const settings = await prisma.settings.findFirst();
  const showSold = settings?.showSoldPublic ?? false;

  if (p.status === "RESERVED") return <div>Producto no disponible.</div>;
  if (!showSold && p.status === "SOLD") return <div>Producto no disponible.</div>;

  const img = p.imageUrl ? cldImg(p.imageUrl, { w: 1200 }) : "https://placehold.co/1200x1200/png?text=GGStore";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">
          <Link href={`/c/${p.category.slug}`} className="underline">{p.category.name}</Link>
        </div>
        <PillLink href={`/c/${p.category.slug}`}>Volver</PillLink>
      </div>

      <div className="gg-surface p-5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Imagen */}
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--gg-border)" }}>
            <div className="relative aspect-square bg-white">
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
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">{p.name}</h1>
              <div className="mt-2 text-2xl font-semibold text-[var(--gg-dark)]">{formatQ(p.priceQ)}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {p.brand ? <span className="gg-chip inline-flex items-center gap-1"><Tag size={14} /> {p.brand}</span> : null}
              {p.size ? <span className="gg-chip inline-flex items-center gap-1"><Ruler size={14} /> {p.size}</span> : null}
              {p.color ? <span className="gg-chip inline-flex items-center gap-1"><Palette size={14} /> {p.color}</span> : null}
              {p.gender ? <span className="gg-chip inline-flex items-center gap-1"><Shirt size={14} /> {p.gender}</span> : null}
              {typeof p.condition === "number" ? <span className="gg-chip">Estado: {p.condition}/10</span> : null}
            </div>

            {p.description ? (
              <div className="rounded-2xl p-4" style={{ background: "var(--gg-secondary)" }}>
                <div className="text-sm font-semibold text-[var(--gg-dark)]">Descripción</div>
                <div className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{p.description}</div>
              </div>
            ) : null}

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
              <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--gg-border)" }}>
                Este producto no está disponible.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
