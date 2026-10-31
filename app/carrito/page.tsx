"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { cldImg } from "@/lib/cloudinary";
import { formatQ } from "@/lib/money";
import { useCart } from "@/components/cart-store";

export default function CartPage() {
  const { items, remove, clear } = useCart();
  const [number, setNumber] = useState("");
  const [baseMsg, setBaseMsg] = useState("");

  useEffect(() => {
    fetch("/api/public/config")
      .then((r) => r.json())
      .then((d) => {
        setNumber(d.whatsappNumber || "");
        setBaseMsg(d.whatsappBaseMessage || "");
      })
      .catch(() => {});
  }, []);

  const total = useMemo(
    () => items.reduce((s, i) => s + i.priceQ * i.qty, 0),
    [items]
  );

  const message = useMemo(() => {
    const head = baseMsg || "Hola, me interesa este pedido:";
    const lines = items.map((i, idx) => {
      const code = i.externalId ?? i.id;
      return `${idx + 1}. ${i.name} (x${i.qty}) - Q${i.priceQ}. Código: ${code}`;
    });
    return `${head}\n\n${lines.join("\n")}\n\nTotal: Q${total}`;
  }, [items, total, baseMsg]);

  const waLink = number ? buildWhatsAppLink({ number, message }) : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/"
          className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Seguir comprando
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Carrito</h1>
        {items.length > 0 && (
          <span className="gg-badge gg-badge-available ml-auto">
            {items.length} {items.length === 1 ? "prenda" : "prendas"}
          </span>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="gg-surface p-12 flex flex-col items-center gap-4 text-center"
        >
          <div
            className="h-20 w-20 rounded-3xl flex items-center justify-center"
            style={{ background: "var(--gg-secondary)" }}
          >
            <ShoppingBag size={36} className="text-[var(--gg-dark)]" />
          </div>
          <div>
            <div className="text-lg font-semibold">Tu carrito está vacío</div>
            <div className="mt-1 text-sm text-neutral-500">
              Agrega prendas desde el catálogo
            </div>
          </div>
          <Link href="/" className="gg-button gg-button-primary inline-flex items-center gap-2">
            Ver catálogo
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Items */}
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((i) => (
                <motion.div
                  key={i.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.22 }}
                  className="gg-surface p-4 flex items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border"
                    style={{ borderColor: "var(--gg-border-soft)" }}
                  >
                    <Image
                      src={
                        i.imageUrl
                          ? cldImg(i.imageUrl, { w: 160 })
                          : "https://placehold.co/160x200/f0fdf4/14532d?text=GG"
                      }
                      alt={i.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm leading-snug line-clamp-2">{i.name}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      #{i.externalId ?? "—"}
                    </div>
                    <div className="mt-1.5">
                      <span className="gg-price-badge" style={{ fontSize: "0.8rem", padding: "0.2rem 0.55rem" }}>
                        {formatQ(i.priceQ)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => remove(i.id)}
                    className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Quitar del carrito"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total */}
          <div className="gg-section p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-[color:var(--gg-muted)]">Total estimado</div>
              <div className="text-2xl font-semibold text-[var(--gg-dark)]">
                {formatQ(total)}
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm("¿Vaciar el carrito?")) clear();
              }}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors underline underline-offset-2"
            >
              Vaciar carrito
            </button>
          </div>

          {/* WhatsApp CTA */}
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "#16a34a", boxShadow: "0 8px 24px rgba(22,163,74,0.35)" }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar pedido por WhatsApp
            </a>
          ) : (
            <div className="rounded-xl border p-4 text-sm text-neutral-600">
              Configura{" "}
              <code className="bg-neutral-100 px-1 rounded">WHATSAPP_NUMBER</code> en{" "}
              <code className="bg-neutral-100 px-1 rounded">.env</code> para activar el
              checkout.
            </div>
          )}
        </>
      )}
    </div>
  );
}
