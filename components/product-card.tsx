"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tag, Ruler, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { formatQ } from "@/lib/money";
import { cldImg } from "@/lib/cloudinary";

type Product = {
  id: string;
  slug: string;
  name: string;
  priceQ: number;
  imageUrl: string | null;
  brand: string | null;
  size: string | null;
  color: string | null;
  gender: string | null;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  category?: { name: string; slug: string } | null;
};

function StatusBadge({ status }: { status: Product["status"] }) {
  if (status === "AVAILABLE") {
    return (
      <span className="gg-badge gg-badge-available">
        <CheckCircle2 size={12} /> Disponible
      </span>
    );
  }
  if (status === "RESERVED") {
    return (
      <span className="gg-badge gg-badge-reserved">
        <Clock3 size={12} /> Reservado
      </span>
    );
  }
  return (
    <span className="gg-badge gg-badge-sold">
      <XCircle size={12} /> Vendido
    </span>
  );
}

export default function ProductCard({
  p,
  showStatus,
}: {
  p: Product;
  showStatus: boolean;
}) {
  const img = p.imageUrl
    ? cldImg(p.imageUrl, { w: 700 })
    : "https://placehold.co/700x700/f0fdf4/14532d?text=GGStore";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="gg-surface overflow-hidden group"
    >
      <Link href={`/p/${p.slug}`} className="block">

        {/* ── Imagen ── */}
        <div className="relative aspect-square overflow-hidden bg-[var(--gg-bg)]">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            <Image
              src={img}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
            />
          </motion.div>

          {/* Gradiente inferior */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
            }}
          />

          {/* Precio flotante — bottom right */}
          <div className="absolute bottom-2 right-2 z-10">
            <span className="gg-price-badge">{formatQ(p.priceQ)}</span>
          </div>

          {/* Status badge — top left */}
          {showStatus && (
            <div className="absolute left-2 top-2 z-10">
              <StatusBadge status={p.status} />
            </div>
          )}
        </div>

        {/* ── Cuerpo ── */}
        <div className="p-3 space-y-1.5">
          {/* Categoría */}
          <div className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--gg-muted)] line-clamp-1">
            {p.category?.name ?? "Sin categoría"}
          </div>

          {/* Nombre */}
          <div className="text-sm font-semibold leading-snug line-clamp-2 text-neutral-800">
            {p.name}
          </div>

          {/* Chips: sólo marca y talla */}
          {(p.brand || p.size) && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {p.brand && (
                <span className="gg-chip inline-flex items-center gap-1 text-[11px]">
                  <Tag size={10} /> {p.brand}
                </span>
              )}
              {p.size && (
                <span className="gg-chip inline-flex items-center gap-1 text-[11px]">
                  <Ruler size={10} /> {p.size}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
