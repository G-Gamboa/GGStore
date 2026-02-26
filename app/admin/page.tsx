import Link from "next/link";
import { Package, BarChart3, Upload, Settings2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

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
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/dashboard" className="gg-card p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 font-semibold"><BarChart3 size={18} /> Dashboard</div>
          <div className="text-sm text-neutral-600">Resumen de inventario/ventas</div>
        </Link>
        <Link href="/admin/products" className="gg-card p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 font-semibold"><Package size={18} /> Productos</div>
          <div className="text-sm text-neutral-600">Crear, editar, vender</div>
        </Link>
        <Link href="/admin/categories" className="gg-card p-4 hover:shadow-md transition-all duration-200">
          <div className="font-semibold">Categorías</div>
          <div className="text-sm text-neutral-600">Administrar categorías</div>
        </Link>
        <Link href="/admin/import" className="gg-card p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 font-semibold"><Upload size={18} /> Importar</div>
          <div className="text-sm text-neutral-600">Subir CSV/TSV</div>
        </Link>
        <Link href="/admin/settings" className="gg-card p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 font-semibold"><Settings2 size={18} /> Settings</div>
          <div className="text-sm text-neutral-600">Mostrar vendidos, modo stock</div>
        </Link>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-2xl border p-4 text-left hover:shadow-sm w-full">
            <div className="font-semibold">Cerrar sesión</div>
            <div className="text-sm text-neutral-600">Salir del admin</div>
          </button>
        </form>
      </div>
    </div>
  );
}
