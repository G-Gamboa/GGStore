"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, LayoutGrid, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-store";


const links = [
  { href: "/categorias", label: "Categorías", icon: LayoutGrid },
  { href: "/carrito", label: "Carrito", icon: ShoppingBag },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();

function NavLink({ href, label, Icon, onClick }: any) {
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  const isCart = href === "/carrito";

  return (
    <Link
      href={href}
      onClick={onClick}
      className="gg-link relative inline-flex items-center gap-2"
    >
      <span className="relative inline-flex">
        <Icon size={16} className={active ? "text-[var(--gg-dark)]" : "text-neutral-600"} />

        {isCart && count > 0 ? (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--gg-dark)] text-white text-[11px] leading-[18px] text-center">
            {count}
          </span>
        ) : null}
      </span>

      <span className={active ? "font-semibold" : ""}>{label}</span>

      {active ? (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 -z-10 rounded-xl"
          style={{ background: "rgba(192,250,190,0.55)" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      ) : null}
    </Link>
  );
}

  return (
    <header className="gg-nav sticky top-0 z-50">
      <div className="gg-nav-inner">
        <Link href="/" className="gg-brand">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl"
            style={{ background: "var(--gg-primary)" }}
          >
            <Leaf size={18} className="text-[var(--gg-dark)]" />
          </span>
          <span>GGStore</span>
        </Link>

        {/* Desktop */}
        <nav className="gg-navlinks hidden md:flex">
          {links.map(({ href, label, icon }) => (
            <NavLink key={href} href={href} label={label} Icon={icon} />
          ))}
        </nav>

        {/* Mobile */}
        <button
          className="md:hidden gg-button gg-button-ghost inline-flex items-center justify-center"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden border-b"
            style={{ borderColor: "var(--gg-border)", background: "#fff" }}
          >
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
              {links.map(({ href, label, icon }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  Icon={icon}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
