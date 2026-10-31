"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-store";

type NavLinkProps = {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
  isCart?: boolean;
  cartCount?: number;
  onClick?: () => void;
};

function NavLink({ href, label, Icon, active, isCart, cartCount, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="gg-link relative inline-flex items-center gap-2"
    >
      <span className="relative inline-flex">
        <Icon
          size={16}
          className={active ? "text-[var(--gg-dark)]" : "text-neutral-500"}
        />
        <AnimatePresence>
          {isCart && cartCount && cartCount > 0 ? (
            <motion.span
              key={cartCount}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[11px] leading-[18px] text-center font-bold"
              style={{ background: "var(--gg-dark)" }}
            >
              {cartCount}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>

      <span className={active ? "font-bold" : ""}>{label}</span>

      {active ? (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 -z-10 rounded-xl"
          style={{ background: "rgba(187, 247, 208, 0.6)" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      ) : null}
    </Link>
  );
}

const links = [
  { href: "/categorias", label: "Categorías", icon: LayoutGrid },
  { href: "/carrito", label: "Carrito", icon: ShoppingBag },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname?.startsWith(href));
  }

  return (
    <header className="gg-nav sticky top-0 z-50">
      <div className="gg-nav-inner">

        {/* Brand */}
        <Link href="/" className="gg-brand group">
          <motion.span
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="inline-flex"
          >
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="44" height="44" rx="12" fill="#14532d"/>
              <path d="M22 32 C22 32 9 24 9 14 C9 8 14.5 6 22 9.5 Z" fill="#4ade80"/>
              <path d="M22 32 C22 32 35 24 35 14 C35 8 29.5 6 22 9.5 Z" fill="#86efac"/>
              <path d="M22 9.5 L22 34" stroke="#d1fae5" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </motion.span>
          <span className="gg-gradient-text text-xl font-black tracking-tight">GGStore</span>
        </Link>

        {/* Desktop nav */}
        <nav className="gg-navlinks hidden md:flex">
          {links.map(({ href, label, icon }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              Icon={icon}
              active={isActive(href)}
              isCart={href === "/carrito"}
              cartCount={count}
            />
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden gg-button gg-button-ghost inline-flex items-center justify-center w-10 h-10 p-0"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "x" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="inline-flex"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden border-b overflow-hidden"
            style={{ borderColor: "var(--gg-border-soft)", background: "#fff" }}
          >
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
              {links.map(({ href, label, icon }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  Icon={icon}
                  active={isActive(href)}
                  isCart={href === "/carrito"}
                  cartCount={count}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
