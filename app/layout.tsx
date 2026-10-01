import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Outfit } from "next/font/google";
import { Leaf } from "lucide-react";
import Navbar from "@/components/navbar";
import { CartProvider } from "@/components/cart-store";

/* Tipografía de la marca Boa Estudio, solo para el crédito */
const outfit = Outfit({ subsets: ["latin"], weight: ["300", "700"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GGStore — Prendas de paca",
    template: "%s | GGStore",
  },
  description:
    "Catálogo de prendas únicas de segunda mano. Camisetas, pantalones, vestidos y más a precios increíbles. Pedidos por WhatsApp.",
  openGraph: {
    siteName: "GGStore",
    type: "website",
    locale: "es_GT",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "Inter, system-ui, sans-serif" }} className="min-h-screen">
        <CartProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

          {/* Footer */}
          <footer className="gg-footer">
            <div className="mx-auto max-w-6xl px-4 py-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl"
                    style={{ background: "var(--gg-primary)" }}
                  >
                    <Leaf size={17} className="text-[var(--gg-dark)]" />
                  </span>
                  <div>
                    <div className="font-bold text-[var(--gg-dark)] leading-tight">GGStore</div>
                    <div className="text-[10px] text-[color:var(--gg-muted)]">Guatemala 🇬🇹</div>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-xs text-[color:var(--gg-muted)] text-center leading-relaxed">
                  Prendas de segunda mano seleccionadas con cuidado.<br />
                  Pedidos directos por WhatsApp, sin complicaciones.
                </p>

                {/* Links */}
                <nav className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="text-xs font-medium text-[color:var(--gg-muted)] hover:text-[var(--gg-dark)] transition-colors"
                  >
                    Catálogo
                  </Link>
                  <Link
                    href="/categorias"
                    className="text-xs font-medium text-[color:var(--gg-muted)] hover:text-[var(--gg-dark)] transition-colors"
                  >
                    Categorías
                  </Link>
                  <Link
                    href="/carrito"
                    className="text-xs font-medium text-[color:var(--gg-muted)] hover:text-[var(--gg-dark)] transition-colors"
                  >
                    Carrito
                  </Link>
                </nav>
              </div>

              {/* Crédito */}
              <div
                className={`${outfit.className} mt-8 pt-6 flex items-baseline justify-center gap-2 text-sm text-[color:var(--gg-muted)]`}
                style={{ borderTop: "1px solid var(--gg-border-soft)" }}
              >
                Desarrollado por
                <a
                  href="https://www.boaestudio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Boa Estudio"
                  className="inline-flex items-baseline text-lg text-[#141a17] opacity-85 hover:opacity-100 transition-opacity"
                >
                  <span className="font-bold tracking-tight">boa</span>
                  <span
                    className="inline-block rounded-full"
                    style={{ width: "0.26em", height: "0.26em", margin: "0 0.24em 0 0.06em", background: "#2f7d5b" }}
                  />
                  <span className="font-light">estudio</span>
                </a>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
