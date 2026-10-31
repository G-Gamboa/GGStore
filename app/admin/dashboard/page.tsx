import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Package, CheckCircle2, Clock3, XCircle, TrendingUp } from "lucide-react";
import { formatQ } from "@/lib/money";

function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const MONTH_NAMES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

function formatMonthKey(key: string) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[m] ?? m} ${y}`;
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

  const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));

  const STATS = [
    { label: "Total prendas", value: total, Icon: Package, bg: "#f0fdf4", border: "#bbf7d0", text: "#14532d" },
    { label: "Disponibles", value: available, Icon: CheckCircle2, bg: "#dcfce7", border: "#86efac", text: "#15803d" },
    { label: "Reservados", value: reserved, Icon: Clock3, bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
    { label: "Vendidos", value: sold, Icon: XCircle, bg: "#fee2e2", border: "#fca5a5", text: "#991b1b" },
    { label: "Ingresos totales", value: formatQ(totalSoldValue), Icon: TrendingUp, bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="gg-button gg-button-ghost inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft size={14} /> Admin
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STATS.map(({ label, value, Icon, bg, border, text }) => (
          <div
            key={label}
            className="rounded-2xl border p-4 flex flex-col gap-2"
            style={{ background: bg, borderColor: border }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: text, opacity: 0.7 }}>
                {label}
              </span>
              <Icon size={15} style={{ color: text, opacity: 0.6 }} />
            </div>
            <div className="text-2xl font-extrabold tracking-tight" style={{ color: text }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Ventas por mes */}
      <div className="gg-surface p-5 space-y-4">
        <div className="font-bold text-[var(--gg-dark)]">Ventas por mes</div>
        {!months.length ? (
          <div className="text-sm text-neutral-500">Aún no hay ventas registradas.</div>
        ) : (
          <div className="space-y-2">
            {months.map(([k, v]) => {
              const pct = Math.round((v / sold) * 100);
              return (
                <div key={k} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-neutral-500 shrink-0">{formatMonthKey(k)}</div>
                  <div className="flex-1 h-2 rounded-full bg-green-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "#16a34a" }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs font-bold text-[var(--gg-dark)]">{v}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
