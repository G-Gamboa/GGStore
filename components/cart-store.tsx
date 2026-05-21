"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  priceQ: number;
  qty: number;
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

  const refresh = useCallback(() => setItems(safeRead()), []);

  useEffect(() => {
    setItems(safeRead());

    const onStorage = (e: StorageEvent) => {
      if (e.key === "CART") setItems(safeRead());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((p: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const curr = [...prev];
      const idx = curr.findIndex((i) => i.id === p.id);
      if (idx >= 0) {
        curr[idx] = { ...curr[idx], qty: 1 };
      } else {
        curr.push({ ...p, qty: 1 });
      }
      safeWrite(curr);
      return curr;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      safeWrite(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    safeWrite([]);
    setItems([]);
  }, []);

  const count = useMemo(
    () => items.reduce((acc, it) => acc + (it.qty || 0), 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, count, add, remove, clear, refresh }),
    [items, count, add, remove, clear, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
