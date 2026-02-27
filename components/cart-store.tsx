"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  priceQ: number;
  qty: number; // en tu caso siempre 1
  imageUrl: string | null;
  externalId: number | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  add: (p: Omit<CartItem, "qty">) => void;
  remove: (id: string) => void;
  clear: () => void;
  refresh: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function safeRead(): CartItem[] {
  try {
    const raw = localStorage.getItem("CART");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function safeWrite(items: CartItem[]) {
  localStorage.setItem("CART", JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const refresh = () => setItems(safeRead());

  useEffect(() => {
    // inicial
    setItems(safeRead());

    // sincroniza si hay otra pestaña
    const onStorage = (e: StorageEvent) => {
      if (e.key === "CART") setItems(safeRead());
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = (p: Omit<CartItem, "qty">) => {
    const curr = safeRead();
    const idx = curr.findIndex((i) => i.id === p.id);

    if (idx >= 0) {
      // prenda única: qty siempre 1
      curr[idx].qty = 1;
    } else {
      curr.push({ ...p, qty: 1 });
    }

    safeWrite(curr);
    setItems(curr);
  };

  const remove = (id: string) => {
    const curr = safeRead().filter((i) => i.id !== id);
    safeWrite(curr);
    setItems(curr);
  };

  const clear = () => {
    safeWrite([]);
    setItems([]);
  };

  const count = useMemo(() => items.reduce((acc, it) => acc + (it.qty || 0), 0), [items]);

  const value: CartContextValue = useMemo(
    () => ({ items, count, add, remove, clear, refresh }),
    [items, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}