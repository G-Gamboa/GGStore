import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { CartProvider } from "@/components/cart-store";

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body style={{ fontFamily: "Inter, system-ui, sans-serif" }} className="min-h-screen">
        <CartProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-10">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
