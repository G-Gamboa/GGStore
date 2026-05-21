"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tag, Ruler, Palette, Shirt, CheckCircle2, XCircle, Clock3 } from "lucide-react";
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
        <CheckCircle2 size={13} /> Disponible
      </span>
    );
  }
  if (status === "RESERVED") {
    return (
      <span className="gg-badge gg-badge-reserved">
        <Clock3 size={13} /> Reservado
      </span>
    );
  }
  return (
    <span className="gg-badge gg-badge-sold">
      <XCircle size={13} /> Vendido
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
    : "https://placehold.co/700x700/png?text=GGStore";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="gg-surface overflow-hidden"
    >
      <Link href={`/p/${p.slug}`} className="block">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
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
            className="absolute inset-x-0 bottom-0 p-2 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55))",
            }}
          >
            <div className="text-white text-xs font-medium line-clamp-1">{p.name}</div>
          </div>

          {showStatus && (
            <div className="absolute left-2 top-2">
              <StatusBadge status={p.status} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs text-neutral-500 line-clamp-1">
                {p.category?.name ?? "Sin categoría"}
              </div>
              <div className="text-sm font-semibold leading-snug line-clamp-2">{p.name}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-base font-semibold text-[var(--gg-dark)]">
                {formatQ(p.priceQ)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {p.brand && (
              <span className="gg-chip inline-flex items-center gap-1 text-xs">
                <Tag size={12} /> {p.brand}
              </span>
            )}
            {p.size && (
              <span className="gg-chip inline-flex items-center gap-1 text-xs">
                <Ruler size={12} /> {p.size}
              </span>
            )}
            {p.color && (
              <span className="gg-chip inline-flex items-center gap-1 text-xs">
                <Palette size={12} /> {p.color}
              </span>
            )}
            {p.gender && (
              <span className="gg-chip inline-flex items-center gap-1 text-xs">
                <Shirt size={12} /> {p.gender}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
