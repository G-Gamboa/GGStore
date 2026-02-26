import Link from "next/link";
import { prisma } from "@/lib/prisma";
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

  const settings = await prisma.settings.findFirst();
  const showSold = settings?.showSoldPublic ?? false;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const where: any = {
    isActive: true,
    ...(showSold ? { status: { in: ["AVAILABLE","SOLD"] } } : { status: "AVAILABLE" }),
  };

  // Reservado nunca se muestra públicamente
  where.status = showSold ? { in: ["AVAILABLE", "SOLD"], not: "RESERVED" } : "AVAILABLE";


  if (q) where.name = { contains: q, mode: "insensitive" };
  if (category) where.category = { slug: category };
  if (brand) where.brand = { equals: brand };
  if (size) where.size = { equals: size };
  if (color) where.color = { equals: color };
  if (gender) where.gender = { equals: gender };
  if (condition) where.condition = { equals: Number(condition) };

  if (min || max) {
    where.priceQ = {};
    if (min) where.priceQ.gte = Number(min);
    if (max) where.priceQ.lte = Number(max);
  }

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

const hasMore = skip + products.length < total;

  // Build filter options from current dataset (simple approach)
  const opts = await prisma.product.findMany({
    where: { isActive: true, ...(showSold ? { status: { in: ["AVAILABLE","SOLD"], not: "RESERVED" } } : { status: "AVAILABLE" }) },
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
            Cada pieza es única. Agrega al carrito y envía tu pedido por WhatsApp.
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
      <section className="gg-surface p-8 text-center">
        <div className="text-lg font-semibold">Sin resultados</div>
        <div className="mt-2 text-neutral-600">Prueba cambiando filtros o limpiando la búsqueda.</div>
      </section>
    ) : (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Productos</div>
          <div className="text-sm text-neutral-600">Orden: más recientes</div>
        </div>
        {/* Grid animado */}
        <ProductGrid products={products} showStatus={showSold} />
        <div className="pt-2 flex items-center justify-center">
  {hasMore ? (
    <Link
      href={buildPageHref(page + 1)}
      className="gg-button gg-button-primary inline-flex items-center gap-2"
    >
      Cargar más
    </Link>
  ) : (
    <div className="text-sm text-neutral-600">No hay más productos.</div>
  )}
</div>
      </section>
    )}
  </div>
);
}