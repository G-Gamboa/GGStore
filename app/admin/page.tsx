import Link from "next/link";
import { Package, BarChart3, Upload, Settings2, LayoutGrid, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

const CARDS = [
  {
    href: "/admin/dashboard",
    Icon: BarChart3,
    label: "Dashboard",
    desc: "Resumen de inventario y ventas",
    color: "#dbeafe",
    border: "#93c5fd",
    text: "#1d4ed8",
  },
  {
    href: "/admin/products",
    Icon: Package,
    label: "Productos",
    desc: "Crear, editar, vender prendas",
    color: "#dcfce7",
    border: "#86efac",
    text: "#14532d",
  },
  {
    href: "/admin/categories",
    Icon: LayoutGrid,
    label: "Categorías",
    desc: "Administrar categorías",
    color: "#fef3c7",
    border: "#fcd34d",
    text: "#92400e",
  },
  {
    href: "/admin/import",
    Icon: Upload,
    label: "Importar",
    desc: "Subir catálogo CSV / TSV",
    color: "#f5f3ff",
    border: "#c4b5fd",
    text: "#5b21b6",
  },
  {
    href: "/admin/settings",
    Icon: Settings2,
    label: "Configuración",
    desc: "Visibilidad, WhatsApp, stock",
    color: "#fff7ed",
    border: "#fed7aa",
    text: "#9a3412",
  },
];

export default async function AdminHome() {
  const user = await requireAdmin();
  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-neutral-600">Necesitas iniciar sesión.</p>
        <Link className="underline" href="/admin/login">Ir a login</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Panel Admin</h1>
        <span className="gg-chip text-xs">{user.email}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ href, Icon, label, desc, color, border, text }) => (
          <Link
            key={href}
            href={href}
            className="gg-cat-card group"
            style={{ background: color, borderColor: border }}
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.7)" }}
            >
              <Icon size={22} style={{ color: text }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm" style={{ color: text }}>{label}</div>
              <div className="text-xs mt-0.5 truncate" style={{ color: text, opacity: 0.65 }}>{desc}</div>
            </div>
          </Link>
        ))}

        {/* Logout */}
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="gg-cat-card w-full text-left"
            style={{ background: "#fef2f2", borderColor: "#fca5a5" }}
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.7)" }}
            >
              <LogOut size={22} style={{ color: "#991b1b" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm" style={{ color: "#991b1b" }}>Cerrar sesión</div>
              <div className="text-xs mt-0.5" style={{ color: "#991b1b", opacity: 0.65 }}>Salir del panel</div>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
