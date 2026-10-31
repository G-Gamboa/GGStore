"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tag, Ruler, XCircle, Clock3, ArrowRight } from "lucide-react";
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
  if (status === "RESERVED") {
    return (
      <span className="gg-badge gg-badge-reserved">
        <Clock3 size={11} /> Reservado
      </span>
    );
  }
  return (
    <span className="gg-badge gg-badge-sold">
      <XCircle size={11} /> Vendido
    </span>
  );
}

export default function ProductCard({ p, showStatus }: { p: Product; showStatus: boolean }) {
  const img = p.imageUrl
    ? cldImg(p.imageUrl, { w: 700 })
    : "https://placehold.co/700x933/f0fdf4/14532d?text=GGStore";

  const isUnavailable = p.status !== "AVAILABLE";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
      className="gg-product-card group"
    >
      <Link href={`/p/${p.slug}`} className="block">

        {/* ── Imagen ── */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-[18px] bg-[var(--gg-bg)]">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            <Image
              src={img}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className={`object-cover transition-[filter] duration-300 ${
                isUnavailable ? "grayscale opacity-60" : ""
              }`}
            />
          </motion.div>

          {/* Gradient para precio */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }}
          />

          {/* Precio */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="gg-price-badge">{formatQ(p.priceQ)}</span>
          </div>

          {/* Status badge */}
          {showStatus && isUnavailable && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <StatusBadge status={p.status} />
            </div>
          )}

          {/* Hover CTA */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold shadow-xl"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(8px)",
                  color: "var(--gg-dark)",
                }}
              >
                Ver prenda <ArrowRight size={15} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="px-3.5 pt-3 pb-3.5 space-y-1.5">
          {/* Categoría */}
          <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gg-muted)] line-clamp-1">
            {p.category?.name ?? "Sin categoría"}
          </div>

          {/* Nombre */}
          <div className="gg-display text-[13px] font-bold leading-snug line-clamp-2 text-neutral-900" style={{ minHeight: "2.6rem", letterSpacing: "-0.02em" }}>
            {p.name}
          </div>

          {/* Chips */}
          {(p.brand || p.size) && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {p.brand && (
                <span className="gg-chip inline-flex items-center gap-1 text-[10px] px-2 py-0.5">
                  <Tag size={9} /> {p.brand}
                </span>
              )}
              {p.size && (
                <span className="gg-chip inline-flex items-center gap-1 text-[10px] px-2 py-0.5">
                  <Ruler size={9} /> {p.size}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
