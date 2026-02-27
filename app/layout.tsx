import "./globals.css";
import Navbar from "@/components/navbar";
import { CartProvider } from "@/components/cart-store";

export const metadata = {
  title: "GGStore",
  description: "Catálogo de prendas de paca",
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
