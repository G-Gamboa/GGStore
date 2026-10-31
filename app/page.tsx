import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Input, Select, Button } from "@/components/ui";
import ProductGrid from "@/components/product-grid";
import { Search, SlidersHorizontal } from "lucide-react";
export const dynamic = "force-dynamic";

type SP = { [k: string]: string | string[] | undefined };

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q as string) || "";
  const category = (sp.category as string) || "";
  const brand = (sp.brand as string) || "";
  const size = (sp.size as string) || "";
  const color = (sp.color as string) || "";
  const gender = (sp.gender as string) || "";
  const condition = (sp.condition as string) || "";
  const min = (sp.min as string) || "";
  const max = (sp.max as string) || "";
  const page = Math.max(1, Number((sp.page as string) || "1"));
  const PAGE_SIZE = 24;
  const skip = (page - 1) * PAGE_SIZE;

  const isUnfiltered = !q && !category && !brand && !size && !color && !gender && !condition && !min && !max;
  const formKey = `${q}|${category}|${brand}|${size}|${color}|${gender}|${condition}|${min}|${max}|${page}`;

  const settings = await prisma.settings.findFirst();
  const showSold = settings?.showSoldPublic ?? false;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    status: showSold ? { in: ["AVAILABLE", "SOLD"], not: "RESERVED" } : "AVAILABLE",
    ...(q && { name: { contains: q, mode: "insensitive" } }),
    ...(category && { category: { slug: category } }),
    ...(brand && { brand }),
    ...(size && { size }),
    ...(color && { color }),
    ...(gender && { gender }),
    ...(condition && { condition: Number(condition) }),
    ...((min || max) && {
      priceQ: {
        ...(min && { gte: Number(min) }),
        ...(max && { lte: Number(max) }),
      },
    }),
  };

  const [total, products, newArrivals] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { category: true },
    }),
    isUnfiltered
      ? prisma.product.findMany({
          where: { isActive: true, status: "AVAILABLE" },
          orderBy: { createdAt: "desc" },
          take: 4,
          include: { category: true },
        })
      : Promise.resolve([]),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

  const getPageWindow = () => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = clamp(page - half, 1, Math.max(1, totalPages - windowSize + 1));
    let end = clamp(start + windowSize - 1, 1, totalPages);
    start = clamp(end - windowSize + 1, 1, totalPages);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  const pages = getPageWindow();

  const opts = await prisma.product.findMany({
    where: { isActive: true, status: showSold ? { in: ["AVAILABLE", "SOLD"], not: "RESERVED" } : "AVAILABLE" },
    select: { brand: true, size: true, color: true, gender: true, condition: true, category: { select: { slug: true } } },
  });

  const uniq = (arr: (string | null)[]) =>
    Array.from(new Set(arr.filter(Boolean) as string[])).sort();
  const uniqNum = (arr: (number | null)[]) =>
    Array.from(new Set(arr.filter((x): x is number => typeof x === "number"))).sort((a, b) => a - b);

  const brands = uniq(opts.map((o) => o.brand));
  const sizes = uniq(opts.map((o) => o.size));
  const colors = uniq(opts.map((o) => o.color));
  const genders = uniq(opts.map((o) => o.gender));
  const conditions = uniqNum(opts.map((o) => o.condition));

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (size) params.set("size", size);
    if (color) params.set("color", color);
    if (gender) params.set("gender", gender);
    if (condition) params.set("condition", condition);
    if (min) params.set("min", min);
    if (max) params.set("max", max);
    params.set("page", String(nextPage));
    return `/?${params.toString()}`;
  };

  const filterFields = (
    <div className="space-y-2">
      <Input name="q" placeholder="Buscar por nombre" defaultValue={q} />
      <Select name="category" defaultValue={category}>
        <option value="">Categoría</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </Select>
      <Select name="brand" defaultValue={brand}>
        <option value="">Marca</option>
        {brands.map((b) => <option key={b} value={b}>{b}</option>)}
      </Select>
      <Select name="size" defaultValue={size}>
        <option value="">Talla</option>
        {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <Select name="color" defaultValue={color}>
        <option value="">Color</option>
        {colors.map((c) => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Select name="gender" defaultValue={gender}>
        <option value="">Género</option>
        {genders.map((g) => <option key={g} value={g}>{g}</option>)}
      </Select>
      <Select name="condition" defaultValue={condition}>
        <option value="">Estado prenda</option>
        {conditions.map((n) => <option key={n} value={String(n)}>{n}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-2">
        <Input name="min" placeholder="Min Q" inputMode="numeric" defaultValue={min} />
        <Input name="max" placeholder="Max Q" inputMode="numeric" defaultValue={max} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* ── 1. Hero ── */}
      <section className="gg-hero">
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <div className="space-y-5 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-white/10 px-3 py-1 text-xs font-semibold text-green-200 backdrop-blur-sm">
                Paca seleccionada · Guatemala
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white" style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                Prendas únicas,{" "}
                <span className="text-[#4ade80]">a tu alcance.</span>
              </h1>
              <p className="text-green-200 text-base leading-relaxed">
                Ropa de segunda mano cuidadosamente seleccionada.
                Pedidos por WhatsApp, sin complicaciones.
              </p>
            </div>

            <div className="flex gap-3 md:flex-col">
              <div className="gg-stat-box">
                <div className="gg-stat-num text-3xl font-extrabold text-[var(--gg-dark)]">
                  {total}
                </div>
                <div className="mt-0.5 text-xs font-medium text-[color:var(--gg-muted)]">
                  Disponibles
                </div>
              </div>
              <div className="gg-stat-box">
                <div className="gg-stat-num text-3xl font-extrabold text-[var(--gg-dark)]">
                  {categories.length}
                </div>
                <div className="mt-0.5 text-xs font-medium text-[color:var(--gg-muted)]">
                  Categorías
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Category strip ── */}
      {categories.length > 0 && (
        <div className="-mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/"
              className="gg-chip shrink-0 whitespace-nowrap transition-colors"
              style={isUnfiltered ? { background: "var(--gg-dark)", color: "#fff", borderColor: "var(--gg-dark)" } : {}}
            >
              Todas
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                className="gg-chip shrink-0 whitespace-nowrap hover:bg-green-50 transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Recién llegado (solo cuando no hay filtros activos) ── */}
      {isUnfiltered && newArrivals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--gg-dark)]" style={{ letterSpacing: "-0.02em" }}>
              Recién llegado
            </h2>
            <span className="gg-chip text-xs">Lo más nuevo</span>
          </div>
          <ProductGrid products={newArrivals} showStatus={false} />
        </section>
      )}

      {/* ── 4. Catálogo con sidebar ── */}
      <section>
        <div className="md:flex md:gap-6 md:items-start">

          {/* Sidebar: filtros (desktop) */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="gg-surface p-4 space-y-3 sticky top-4">
              <div className="flex items-center gap-2 pb-1" style={{ borderBottom: "1px solid var(--gg-border-soft)" }}>
                <SlidersHorizontal size={14} style={{ color: "var(--gg-dark)" }} />
                <div className="font-bold text-sm text-[var(--gg-dark)]">Filtros</div>
              </div>
              <form key={formKey} className="space-y-2">
                {filterFields}
                <Button type="submit" variant="primary" className="w-full mt-1">Aplicar</Button>
                <Link href="/" className="gg-button gg-button-ghost w-full inline-flex items-center justify-center text-sm">
                  Limpiar
                </Link>
              </form>
            </div>
          </aside>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Filtro móvil (collapsible) */}
            <div className="gg-surface p-4 md:hidden">
              <details>
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: "var(--gg-secondary)" }}>
                      <SlidersHorizontal size={14} style={{ color: "var(--gg-dark)" }} />
                    </div>
                    <div className="font-bold text-[var(--gg-dark)]">Filtros</div>
                  </div>
                  <span className="gg-chip">Abrir</span>
                </summary>
                <div className="mt-4">
                  <form key={formKey} className="space-y-3">
                    {filterFields}
                    <div className="flex gap-3 pt-1">
                      <Button type="submit" variant="primary">Aplicar</Button>
                      <Link href="/" className="gg-button gg-button-ghost inline-flex items-center">Limpiar</Link>
                    </div>
                  </form>
                </div>
              </details>
            </div>

            {/* Encabezado del catálogo */}
            {products.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-[var(--gg-dark)]">Catálogo</div>
                  <span className="gg-badge gg-badge-available">{total}</span>
                </div>
                <span className="gg-chip text-xs">Más recientes</span>
              </div>
            )}

            {/* Grid o estado vacío */}
            {products.length === 0 ? (
              <div className="gg-surface p-10 flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-3xl flex items-center justify-center" style={{ background: "var(--gg-secondary)" }}>
                  <Search size={28} style={{ color: "var(--gg-dark)" }} />
                </div>
                <div>
                  <div className="text-lg font-semibold">Sin resultados</div>
                  <div className="mt-1 text-sm text-neutral-500 max-w-xs">
                    No encontramos prendas con esos filtros. Intenta con otros criterios.
                  </div>
                </div>
                <Link href="/" className="gg-button gg-button-primary inline-flex items-center gap-2">
                  Limpiar filtros
                </Link>
              </div>
            ) : (
              <>
                <ProductGrid products={products} showStatus={showSold} />

                {/* Paginación */}
                <div className="pt-4 flex items-center justify-center gap-2 flex-wrap">
                  <Link
                    href={buildPageHref(Math.max(1, page - 1))}
                    aria-disabled={page === 1}
                    className={`gg-button gg-button-ghost ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    ←
                  </Link>
                  {pages.map((p) => (
                    <Link
                      key={p}
                      href={buildPageHref(p)}
                      className={`gg-button ${p === page ? "gg-button-primary" : "gg-button-ghost"}`}
                    >
                      {p}
                    </Link>
                  ))}
                  <Link
                    href={buildPageHref(Math.min(totalPages, page + 1))}
                    aria-disabled={page === totalPages}
                    className={`gg-button gg-button-ghost ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
                  >
                    →
                  </Link>
                </div>
                <div className="pt-2 text-center text-sm text-neutral-600">
                  Página {page} de {totalPages} · {total} productos
                </div>
              </>
            )}

          </div>
        </div>
      </section>

    </div>
  );
}
