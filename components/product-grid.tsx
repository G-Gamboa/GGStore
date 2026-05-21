"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/product-card";

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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function ProductGrid({
  products,
  showStatus,
}: {
  products: Product[];
  showStatus: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {products.map((p) => (
        <motion.div key={p.id} variants={item}>
          <ProductCard p={p} showStatus={showStatus} />
        </motion.div>
      ))}
    </motion.div>
  );
}
