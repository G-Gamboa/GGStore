"use client";

import { ShoppingBag, ShoppingCart, ArrowRight, Store } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCart } from "@/components/cart-store";

type ProductProps = {
  id: string;
  slug: string;
  name: string;
  priceQ: number;
  imageUrl: string | null;
  externalId: number | null;
};

export default function AddToCart({ product }: { product: ProductProps }) {
  const [added, setAdded] = useState(false);
  const { add: addToCart, count } = useCart();

  function handleAdd() {
    addToCart(product);
    setAdded(true);
  }

  return (
    <AnimatePresence mode="wait">
      {added ? (
        <motion.div
          key="added"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="gg-surface p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-[var(--gg-dark)] font-semibold">
            <ShoppingCart size={18} />
            ¡Agregado al carrito!
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/carrito"
              className="gg-button gg-button-primary inline-flex items-center justify-center gap-2"
            >
              Ver carrito ({count}) <ArrowRight size={16} />
            </Link>
            <Link
              href="/"
              className="gg-button gg-button-ghost inline-flex items-center justify-center gap-2"
            >
              <Store size={16} /> Seguir comprando
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="add"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          onClick={handleAdd}
          className="gg-button gg-button-primary inline-flex items-center gap-2"
        >
          <ShoppingBag size={18} /> Agregar al carrito
        </motion.button>
      )}
    </AnimatePresence>
  );
}
