import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/navbar";
import { CartProvider } from "@/components/cart-store";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const outfit = Outfit({ subsets: ["latin"], weight: ["300", "700"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GGStore — Prendas de paca en Guatemala",
    template: "%s | GGStore",
  },
  description:
    "GGStore — Ropa de segunda mano seleccionada en Guatemala. Camisetas, pantalones, vestidos y más a precios increíbles. Pedidos directos por WhatsApp, sin complicaciones.",
  keywords: [
    "ropa segunda mano Guatemala",
    "paca Guatemala",
    "prendas usadas Guatemala",
    "ropa barata Guatemala",
    "GGStore Guatemala",
    "ropa paca seleccionada",
    "comprar ropa usada Guatemala",
  ],
  authors: [{ name: "GGStore" }],
  robots: { index: true, follow: true },
  openGraph: {
    siteName: "GGStore",
    type: "website",
    locale: "es_GT",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen`}>
        <CartProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

          {/* Footer */}
          <footer className="gg-footer">
            <div className="mx-auto max-w-6xl px-4 py-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                  <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect width="44" height="44" rx="12" fill="#14532d"/>
                    <path d="M22 32 C22 32 9 24 9 14 C9 8 14.5 6 22 9.5 Z" fill="#4ade80"/>
                    <path d="M22 32 C22 32 35 24 35 14 C35 8 29.5 6 22 9.5 Z" fill="#86efac"/>
                    <path d="M22 9.5 L22 34" stroke="#d1fae5" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <div className="font-bold text-[var(--gg-dark)] leading-tight">GGStore</div>
                    <div className="text-[10px] text-[color:var(--gg-muted)]">Guatemala</div>
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
