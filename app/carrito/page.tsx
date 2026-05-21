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
        <h1 className="text-2xl font-semibold">Carrito</h1>
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
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border"
                    style={{ borderColor: "var(--gg-border)" }}
                  >
                    <Image
                      src={
                        i.imageUrl
                          ? cldImg(i.imageUrl, { w: 160 })
                          : "https://placehold.co/160x160/png?text=GG"
                      }
                      alt={i.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{i.name}</div>
                    <div className="text-sm text-neutral-500">
                      Código: {i.externalId ?? "—"}
                    </div>
                  </div>

                  {/* Price + remove */}
                  <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    <div className="font-semibold text-[var(--gg-dark)]">
                      {formatQ(i.priceQ)}
                    </div>
                    <button
                      onClick={() => remove(i.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors inline-flex items-center gap-1 text-xs"
                    >
                      <Trash2 size={13} /> Quitar
                    </button>
                  </div>
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
              className="gg-button gg-button-primary w-full inline-flex items-center justify-center gap-2 text-base py-4"
            >
              <MessageCircle size={20} /> Enviar pedido por WhatsApp
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
