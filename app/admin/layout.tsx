import Link from "next/link";
import { ChevronLeft, LayoutDashboard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--gg-bg)" }}>
      <div className="gg-nav">
        <div className="gg-nav-inner">
          <div className="flex items-center gap-3">
            <Link href="/" className="gg-link inline-flex items-center gap-2">
              <ChevronLeft size={16} />
              Volver al catálogo
            </Link>
            <span className="text-neutral-300">|</span>
            <Link href="/admin" className="gg-link inline-flex items-center gap-2">
              <LayoutDashboard size={16} />
              Admin
            </Link>
          </div>
          <div className="text-sm font-semibold text-[var(--gg-dark)]">Panel Administrativo</div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>
    </div>
  );
}
