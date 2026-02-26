"use client";

import { ShoppingBag } from "lucide-react";

import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  slug: string;
  name: string;
  priceQ: number;
  qty: number;
  imageUrl: string | null;
  externalId: number | null;
};

export default function AddToCart({ product }: { product: Omit<CartItem, "qty"> }) {
  const [added, setAdded] = useState(false);

  function read(): CartItem[] {
    try { return JSON.parse(localStorage.getItem("CART") || "[]"); } catch { return []; }
  }

  function write(items: CartItem[]) {
    localStorage.setItem("CART", JSON.stringify(items));
  }

  function add() {
    const items = read();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx >= 0) {
      // Cada prenda es única: no permitimos cantidades > 1
      items[idx].qty = 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    write(items);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={add} className="gg-button gg-button-primary inline-flex items-center gap-2">
        <ShoppingBag size={18} /> Agregar al carrito
      </button>
      {added ? <div className="text-sm text-neutral-600">Agregado.</div> : null}
    </div>
  );
}
