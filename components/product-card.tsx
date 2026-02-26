"use client";

import Link from "next/link";
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
        <CheckCircle2 size={14} /> Disponible
      </span>
    );
  }
  if (status === "RESERVED") {
    return (
      <span className="gg-badge gg-badge-reserved">
        <Clock3 size={14} /> Reservado
      </span>
    );
  }
  return (
    <span className="gg-badge gg-badge-sold">
      <XCircle size={14} /> Vendido
    </span>
  );
}

export default function ProductCard({ p, showStatus }: { p: Product; showStatus: boolean }) {
  const img = p.imageUrl ? cldImg(p.imageUrl, { w: 900 }) : "https://placehold.co/900x900/png?text=GGStore";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="gg-surface overflow-hidden"
    >
      <Link href={`/p/${p.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={img}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.35 }}
          />
          <div className="absolute inset-x-0 bottom-0 p-3"
            style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55))" }}
          >
            <div className="text-white text-sm font-medium line-clamp-1">{p.name}</div>
          </div>

          {showStatus ? (
            <div className="absolute left-3 top-3">
              <StatusBadge status={p.status} />
            </div>
          ) : null}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-neutral-600 line-clamp-1">
                {p.category?.name || "Sin categoría"}
              </div>
              <div className="font-semibold leading-tight line-clamp-2">{p.name}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-lg font-semibold text-[var(--gg-dark)]">{formatQ(p.priceQ)}</div>
              <div className="text-xs text-neutral-500">Q exactos</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {p.brand ? (
              <span className="gg-chip inline-flex items-center gap-1">
                <Tag size={14} /> {p.brand}
              </span>
            ) : null}
            {p.size ? (
              <span className="gg-chip inline-flex items-center gap-1">
                <Ruler size={14} /> {p.size}
              </span>
            ) : null}
            {p.color ? (
              <span className="gg-chip inline-flex items-center gap-1">
                <Palette size={14} /> {p.color}
              </span>
            ) : null}
            {p.gender ? (
              <span className="gg-chip inline-flex items-center gap-1">
                <Shirt size={14} /> {p.gender}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
