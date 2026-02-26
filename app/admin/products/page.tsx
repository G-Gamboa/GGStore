import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import ProductsListClient from "./list";

export default async function ProductsPage() {
  const user = await requireAdmin();
  if (!user) return <div>Unauthorized. Ve a /admin/login</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-neutral-600">Listado, filtros y acciones.</p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin" className="gg-button gg-button-ghost">← Admin</Link>
          <Link href="/admin/products/new" className="gg-button gg-button-primary">+ Nuevo</Link>
        </div>
      </div>

      <ProductsListClient />
    </div>
  );
}