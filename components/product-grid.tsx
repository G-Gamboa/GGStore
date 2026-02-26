"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/product-card";

export default function ProductGrid({ products, showStatus }: any) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.04 } },
      }}
      className="grid gap-4 grid-cols-2 md:grid-cols-3"
    >
      {products.map((p: any) => (
        <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <ProductCard p={p} showStatus={showStatus} />
        </motion.div>
      ))}
    </motion.div>
  );
}
