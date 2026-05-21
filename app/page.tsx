import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Input, Select, Button } from "@/components/ui";
import ProductGrid from "@/components/product-grid";
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
  
  const formKey = `${q}|${category}|${brand}|${size}|${color}|${gender}|${condition}|${min}|${max}|${page}`;


  const settings = await prisma.settings.findFirst();
  const showSold = settings?.showSoldPublic ?? false;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  // RESERVED nunca se muestra públicamente
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

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { category: true },
    }),
  ]);


  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const getPageWindow = () => {
  const windowSize = 5; // 1 2 3 4 5
  const half = Math.floor(windowSize / 2);

  let start = clamp(page - half, 1, Math.max(1, totalPages - windowSize + 1));
  let end = clamp(start + windowSize - 1, 1, totalPages);

  // re-ajuste si nos quedamos cortos
  start = clamp(end - windowSize + 1, 1, totalPages);

  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
};

const pages = getPageWindow();

const hasMore = skip + products.length < total;

  const opts = await prisma.product.findMany({
    where: { isActive: true, status: showSold ? { in: ["AVAILABLE", "SOLD"], not: "RESERVED" } : "AVAILABLE" },
    select: { brand: true, size: true, color: true, gender: true, condition: true, category: { select: { slug: true } } },
  });

  const uniq = (arr: (string | null)[]) => Array.from(new Set(arr.filter(Boolean) as string[])).sort();
  const uniqNum = (arr: (number | null)[]) => Array.from(new Set(arr.filter((x): x is number => typeof x === "number"))).sort((a,b)=>a-b);

  const brands = uniq(opts.map(o=>o.brand));
  const sizes = uniq(opts.map(o=>o.size));
  const colors = uniq(opts.map(o=>o.color));
  const genders = uniq(opts.map(o=>o.gender));
  const conditions = uniqNum(opts.map(o=>o.condition));


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

  return (
  <div className="space-y-8">
    <section className="gg-section p-8 md:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[var(--gg-dark)]">Prendas únicas, seleccionadas cuidadosamente</h1>
          <p className="mt-2 text-[color:var(--gg-muted)] max-w-2xl">
            Agrega al carrito y envía tu pedido por WhatsApp.
          </p>
        </div>
        <div className="gg-surface px-4 py-3 inline-flex items-center gap-3">
          <div className="text-sm text-neutral-600">Productos:</div>
          <div className="text-lg font-semibold">{total}</div>
        </div>
      </div>
    </section>

    <section className="gg-surface p-6 space-y-4 hidden md:block">
  <div className="flex items-center justify-between">
    <div>
      <div className="text-sm text-neutral-600">Encuentra lo que necesitas</div>
      <div className="text-lg font-semibold">Filtros</div>
    </div>
    <div className="text-sm text-neutral-600">
      {showSold ? "Mostrando disponibles y vendidos" : "Mostrando solo disponibles"}
    </div>
  </div>

  <form key={formKey} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <Input name="q" placeholder="Buscar por nombre" defaultValue={q} />

    <Select name="category" defaultValue={category}>
      <option value="">Categoría</option>
      {categories.map(c => (
        <option key={c.slug} value={c.slug}>{c.name}</option>
      ))}
    </Select>

    <Select name="brand" defaultValue={brand}>
      <option value="">Marca</option>
      {brands.map(b => <option key={b} value={b}>{b}</option>)}
    </Select>

    <Select name="size" defaultValue={size}>
      <option value="">Talla</option>
      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
    </Select>

    <Select name="color" defaultValue={color}>
      <option value="">Color</option>
      {colors.map(c => <option key={c} value={c}>{c}</option>)}
    </Select>

    <Select name="gender" defaultValue={gender}>
      <option value="">Género</option>
      {genders.map(g => <option key={g} value={g}>{g}</option>)}
    </Select>

    <Select name="condition" defaultValue={condition}>
      <option value="">Estado prenda</option>
      {conditions.map(n => <option key={n} value={String(n)}>{n}</option>)}
    </Select>

    <div className="grid gap-3 sm:grid-cols-2">
      <Input name="min" placeholder="Min Q" inputMode="numeric" defaultValue={min} />
      <Input name="max" placeholder="Max Q" inputMode="numeric" defaultValue={max} />
    </div>

    <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
      <Button type="submit" variant="primary">Aplicar</Button>
      <Link href="/" className="gg-button gg-button-ghost inline-flex items-center">Limpiar</Link>
    </div>
  </form>
</section>

<section className="gg-surface p-5 md:hidden">
  <details>
    <summary className="cursor-pointer list-none flex items-center justify-between">
      <div>
        <div className="text-sm text-neutral-600">Encuentra lo que necesitas</div>
        <div className="text-lg font-semibold">Filtros</div>
      </div>
      <span className="gg-chip">Abrir</span>
    </summary>
    <div className="mt-4 space-y-3">
      <div className="text-sm text-neutral-600">
        {showSold ? "Mostrando disponibles y vendidos" : "Mostrando solo disponibles"}
      </div>
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <Input name="q" placeholder="Buscar por nombre" defaultValue={q} />

    <Select name="category" defaultValue={category}>
      <option value="">Categoría</option>
      {categories.map(c => (
        <option key={c.slug} value={c.slug}>{c.name}</option>
      ))}
    </Select>

    <Select name="brand" defaultValue={brand}>
      <option value="">Marca</option>
      {brands.map(b => <option key={b} value={b}>{b}</option>)}
    </Select>

    <Select name="size" defaultValue={size}>
      <option value="">Talla</option>
      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
    </Select>

    <Select name="color" defaultValue={color}>
      <option value="">Color</option>
      {colors.map(c => <option key={c} value={c}>{c}</option>)}
    </Select>

    <Select name="gender" defaultValue={gender}>
      <option value="">Género</option>
      {genders.map(g => <option key={g} value={g}>{g}</option>)}
    </Select>

    <Select name="condition" defaultValue={condition}>
      <option value="">Estado prenda</option>
      {conditions.map(n => <option key={n} value={String(n)}>{n}</option>)}
    </Select>

    <div className="grid gap-3 sm:grid-cols-2">
      <Input name="min" placeholder="Min Q" inputMode="numeric" defaultValue={min} />
      <Input name="max" placeholder="Max Q" inputMode="numeric" defaultValue={max} />
    </div>

    <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
      <Button type="submit" variant="primary">Aplicar</Button>
      <Link href="/" className="gg-button gg-button-ghost inline-flex items-center">Limpiar</Link>
    </div>
  </form>
    </div>
  </details>
</section>

    {products.length === 0 ? (
      <section className="gg-surface p-10 flex flex-col items-center gap-4 text-center">
        <div
          className="h-16 w-16 rounded-3xl flex items-center justify-center"
          style={{ background: "var(--gg-secondary)" }}
        >
          <span className="text-3xl">🔍</span>
        </div>
        <div>
          <div className="text-lg font-semibold">Sin resultados</div>
          <div className="mt-1 text-sm text-neutral-500 max-w-xs">
            No encontramos prendas con esos filtros. Intenta con otros criterios o limpia la búsqueda.
          </div>
        </div>
        <Link
          href="/"
          className="gg-button gg-button-primary inline-flex items-center gap-2"
        >
          Limpiar filtros
        </Link>
      </section>
    ) : (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Productos</div>
          <div className="text-sm text-neutral-600">Orden: más recientes</div>
        </div>
        <ProductGrid products={products} showStatus={showSold} />
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
      </section>
    )}
  </div>
);
}