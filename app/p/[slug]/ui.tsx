"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-store";

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
  const router = useRouter();
  const { add: addToCart } = useCart();

  function add() {
    addToCart(product);

    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
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