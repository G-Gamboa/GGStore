"use client";

import { MessageCircle, Trash2 } from "lucide-react";
import { cldImg } from "@/lib/cloudinary";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type CartItem = {
  id: string;
  slug: string;
  name: string;
  priceQ: number;
  qty: number;
  externalId: number | null;
  imageUrl?: string | null;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [number, setNumber] = useState<string>("");
  const [baseMsg, setBaseMsg] = useState<string>("");

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("CART") || "[]"));
    } catch {
      setItems([]);
    }

    // fetch env-derived values via api (client-safe)
    fetch("/api/public/config")
      .then(r => r.json())
      .then(d => { setNumber(d.whatsappNumber || ""); setBaseMsg(d.whatsappBaseMessage || ""); })
      .catch(() => {});
  }, []);

  const total = useMemo(() => items.reduce((s, i) => s + i.priceQ * i.qty, 0), [items]);

  function save(items: CartItem[]) {
    setItems(items);
    localStorage.setItem("CART", JSON.stringify(items));
  }

  function remove(id: string) {
    const next = items.filter(i => i.id !== id);
    save(next);
  }

  function clear() {
    save([]);
  }

  const message = useMemo(() => {
    const head = baseMsg || "Hola, me interesa este pedido:";
    const lines = items.map((i, idx) => {
      const code = i.externalId ?? i.id;
      return `${idx + 1}. ${i.name} (x${i.qty}) - Q${i.priceQ} c/u. Código: ${code}`;
    });
    return `${head}\n\n${lines.join("\n")}\n\nTotal: Q${total}`;
  }, [items, total, baseMsg]);

  const waLink = number ? buildWhatsAppLink({ number, message }) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Carrito</h1>

      {!items.length ? (
        <div className="rounded-2xl border p-6">
          <div className="text-neutral-700">Tu carrito está vacío.</div>
          <Link href="/" className="mt-3 inline-block underline">Ver catálogo</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map(i => (
              <div key={i.id} className="gg-surface p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img
                    src={i.imageUrl ? cldImg(i.imageUrl, { w: 160 }) : "https://placehold.co/160x160/png?text=GG"}
                    alt={i.name}
                    className="h-14 w-14 rounded-xl object-cover border"
                    style={{ borderColor: "var(--gg-border)" }}
                  />
                  <div>
                    <div className="font-semibold">{i.name}</div>
                  <div className="text-sm text-neutral-600">Q{i.priceQ} c/u · Código: {i.externalId ?? "-"}</div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span>Cant: 1</span>
                    <button className="ml-2 text-sm underline" onClick={() => remove(i.id)}><Trash2 size={16} className="inline-block mr-1" />Quitar</button>
                  </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-[var(--gg-dark)]">Q{i.priceQ * i.qty}</div>
              </div>
            ))}
          </div>

          <div className="gg-surface p-5 flex items-center justify-between">
            <div className="font-semibold">Total: Q{total}</div>
            <button className="text-sm underline" onClick={clear}>Vaciar</button>
          </div>

          {waLink ? (
            <a className="gg-button gg-button-primary inline-flex items-center justify-center"
               href={waLink} target="_blank">
              <span className="inline-flex items-center gap-2"><MessageCircle size={18} /> Enviar por WhatsApp</span>
            </a>
          ) : (
            <div className="rounded-xl border p-3 text-sm">
              Configura <code>WHATSAPP_NUMBER</code> en <code>.env</code>.
            </div>
          )}

          <div className="text-xs text-neutral-600">
            Nota: enviar a WhatsApp no cambia el inventario automáticamente. Marca vendido desde Admin cuando confirmes la venta.
          </div>
        </>
      )}
    </div>
  );
}
