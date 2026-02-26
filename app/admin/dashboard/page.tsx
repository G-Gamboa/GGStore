import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default async function DashboardPage() {
  const user = await requireAdmin();
  if (!user) return <div>Unauthorized. Ve a /admin/login</div>;

  const total = await prisma.product.count();
  const available = await prisma.product.count({ where: { status: "AVAILABLE" } });
  const reserved = await prisma.product.count({ where: { status: "RESERVED" } });
  const sold = await prisma.product.count({ where: { status: "SOLD" } });

  const soldProducts = await prisma.product.findMany({
    where: { status: "SOLD", soldAt: { not: null } },
    select: { soldAt: true, priceQ: true },
  });

  const byMonth: Record<string, number> = {};
  let totalSoldValue = 0;

  for (const p of soldProducts) {
    totalSoldValue += p.priceQ;
    const k = monthKey(p.soldAt!);
    byMonth[k] = (byMonth[k] || 0) + 1;
  }

  const months = Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6">
                      <Link href="/admin" className="gg-button gg-button-ghost">← Admin</Link>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="gg-surface p-5">
          <div className="text-sm text-neutral-600">Total</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="gg-surface p-5">
          <div className="text-sm text-neutral-600">Disponibles</div>
          <div className="text-2xl font-semibold">{available}</div>
        </div>
        <div className="gg-surface p-5">
          <div className="text-sm text-neutral-600">Reservados</div>
          <div className="text-2xl font-semibold">{reserved}</div>
        </div>
        <div className="gg-surface p-5">
          <div className="text-sm text-neutral-600">Vendidos</div>
          <div className="text-2xl font-semibold">{sold}</div>
        </div>
        <div className="gg-surface p-5">
          <div className="text-sm text-neutral-600">Total vendido (Q)</div>
          <div className="text-2xl font-semibold">{totalSoldValue}</div>
        </div>
      </div>

      <div className="rounded-2xl border p-5 space-y-3">
        <div className="font-semibold">Ventas por mes (conteo)</div>
        {!months.length ? (
          <div className="text-sm text-neutral-600">Aún no hay ventas registradas.</div>
        ) : (
          <div className="grid gap-2 text-sm">
            {months.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b last:border-b-0 py-2">
                <div>{k}</div>
                <div className="font-semibold">{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
