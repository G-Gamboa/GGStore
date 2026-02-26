"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { CheckCircle2, XCircle, Clock3, Undo2 } from "lucide-react";

type Category = { id: string; name: string; slug: string };
const CLOUDINARY_CLOUD = "dk7aiheee";
const CLOUDINARY_FOLDER = "ggstore";

type Product = {
  id: string;
  externalId: number | null;
  name: string;
  slug: string;
  priceQ: number;
  brand: string | null;
  size: string | null;
  color: string | null;
  condition: number | null;
  gender: string | null;
  imageUrl: string | null;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  isActive: boolean;
  categoryId: string;
  category: Category;
};

export default function ProductsClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);


  const [filters, setFilters] = useState({
    estado: "Disponible", // Disponible | Vendido | Reservado | Todos
    talla: "",
    marca: "",
    genero: "",
    categoriaId: "",
    idProducto: "",
  });

  const [form, setForm] = useState<any>({
    id: "",
    externalId: "",
    name: "",
    priceQ: "",
    categoryId: "",
    brand: "",
    size: "",
    color: "",
    condition: "",
    gender: "",
    isActive: true,
  });

  const isEditing = !!form.id;

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/overview");
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setCategories(data.categories);
    setProducts(data.products);
    setForm((f: any) => ({ ...f, categoryId: data.categories[0]?.id || "" }));
    setFilters((x:any)=>({ ...x, categoriaId: "" }));
    setLoading(false);
  }

  useEffect(() => {
    load().catch((e)=>setMsg(String(e)));
  }, []);

  function reset() {
    setForm({
      id: "",
      externalId: "",
      name: "",
      priceQ: "",
      categoryId: categories[0]?.id || "",
      brand: "",
      size: "",
      color: "",
      condition: "",
      gender: "",
        isActive: true,
    });
  }

  async function save() {
    setMsg(null);
    if (!String(form.externalId || "").trim()) { setMsg("Debes ingresar el ID (externalId)."); return; }
    const payload = {
      id: form.id || undefined,
      externalId: Number(form.externalId),
      name: String(form.name || "").trim(),
      priceQ: Number(form.priceQ),
      categoryId: form.categoryId,
      brand: form.brand?.trim() || null,
      size: form.size?.trim() || null,
      color: form.color?.trim() || null,
      condition: form.condition ? Number(form.condition) : null,
      gender: form.gender?.trim() || null,
      isActive: !!form.isActive,
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { setMsg(await res.text()); return; }
    await load();
    reset();
  }

  async function del(id: string) {
    setMsg(null);
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) { setMsg(await res.text()); return; }
    await load();
  }

  async function setStatus(id: string, status: "AVAILABLE" | "RESERVED" | "SOLD") {
    setMsg(null);
    const res = await fetch("/api/admin/products/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) { setMsg(await res.text()); return; }
    await load();
  }

  const filtered = useMemo(() => {
    return products.filter(p => {
      // Estado
      if (filters.estado !== "Todos") {
        const map: any = { "Disponible": "AVAILABLE", "Vendido": "SOLD", "Reservado": "RESERVED" };
        if (p.status !== map[filters.estado]) return false;
      }
      if (filters.talla && (p.size || "") !== filters.talla) return false;
      if (filters.marca && (p.brand || "") !== filters.marca) return false;
      if (filters.genero && (p.gender || "") !== filters.genero) return false;
      if (filters.categoriaId && p.categoryId !== filters.categoriaId) return false;
      if (filters.idProducto) {
        const n = Number(filters.idProducto);
        if (!Number.isFinite(n)) return false;
        if ((p.externalId ?? -1) !== n) return false;
      }
      return true;
    });
  }, [products, filters]);

  const sorted = useMemo(() => [...filtered].sort((a,b)=> (a.status === b.status ? b.priceQ - a.priceQ : (a.status === "AVAILABLE" ? -1 : (a.status === "RESERVED" ? 0 : 1)))), [filtered]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <p className="text-sm text-neutral-600">CRUD + marcar vendido.</p>
      </section>

      {msg ? <div className="rounded-xl border p-3 text-sm text-red-600">{msg}</div> : null}

      <section className="grid gap-3 rounded-2xl border p-5">
        <div className="font-semibold">{isEditing ? "Editar" : "Nuevo"} producto</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Id externo (SKU)" value={form.externalId} onChange={(e)=>setForm({...form, externalId:e.target.value})} />
          <Input placeholder="Nombre" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
          <Input placeholder="Precio (Q) ej. 150" inputMode="numeric" value={form.priceQ} onChange={(e)=>setForm({...form, priceQ:e.target.value})} />
          <Select value={form.categoryId} onChange={(e)=>setForm({...form, categoryId:e.target.value})}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <Input placeholder="Marca" value={form.brand} onChange={(e)=>setForm({...form, brand:e.target.value})} />
          <Input placeholder="Talla" value={form.size} onChange={(e)=>setForm({...form, size:e.target.value})} />
          <Input placeholder="Color" value={form.color} onChange={(e)=>setForm({...form, color:e.target.value})} />
          <Input placeholder="Estado (1-10)" inputMode="numeric" value={form.condition} onChange={(e)=>setForm({...form, condition:e.target.value})} />
          <Input placeholder="Género" value={form.gender} onChange={(e)=>setForm({...form, gender:e.target.value})} />
          <div className="sm:col-span-2 gg-surface p-4 flex items-center justify-between gap-4">
  <div className="text-sm">
    <div className="font-semibold">Imagen (automática)</div>
    <div className="text-neutral-600">
      Se genera como <span className="font-mono">P_{String(form.externalId || "").trim()}</span>
    </div>
  </div>
  <div className="h-14 w-14 overflow-hidden rounded-xl border" style={{ borderColor: "var(--gg-border)" }}>
    {String(form.externalId || "").trim() ? (
      <img
        src={`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto,w_200,c_limit/${CLOUDINARY_FOLDER}/P_${String(form.externalId || "").trim()}`}
        alt="Preview"
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="h-full w-full bg-neutral-100" />
    )}
  </div>
</div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e)=>setForm({...form, isActive:e.target.checked})} />
          Activo (visible)
        </label>

        <div className="flex gap-2">
          <Button onClick={save}>Guardar</Button>
          {isEditing ? <Button onClick={reset}>Cancelar</Button> : null}
        </div>
      </section>

      <section className="rounded-2xl border p-5 space-y-4">
  <div className="font-semibold">Filtros de Búsqueda</div>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <div>
      <div className="text-sm font-medium mb-1">Estado</div>
      <Select value={filters.estado} onChange={(e)=>setFilters({...filters, estado:e.target.value})}>
        <option value="Todos">Todos</option>
        <option value="Disponible">Disponible</option>
        <option value="Vendido">Vendido</option>
        <option value="Reservado">Reservado</option>
      </Select>
    </div>

    <div>
      <div className="text-sm font-medium mb-1">Talla</div>
      <Input placeholder="Ej. M" value={filters.talla} onChange={(e)=>setFilters({...filters, talla:e.target.value})} />
    </div>

    <div>
      <div className="text-sm font-medium mb-1">Marca</div>
      <Input placeholder="Ej. RBX" value={filters.marca} onChange={(e)=>setFilters({...filters, marca:e.target.value})} />
    </div>

    <div>
      <div className="text-sm font-medium mb-1">Género</div>
      <Select value={filters.genero} onChange={(e)=>setFilters({...filters, genero:e.target.value})}>
        <option value="">Todos</option>
        <option value="Hombre">Hombre</option>
        <option value="Mujer">Mujer</option>
        <option value="Unisex">Unisex</option>
      </Select>
    </div>

    <div>
      <div className="text-sm font-medium mb-1">Categoría</div>
      <Select value={filters.categoriaId} onChange={(e)=>setFilters({...filters, categoriaId:e.target.value})}>
        <option value="">Todas</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
    </div>

    <div>
      <div className="text-sm font-medium mb-1">ID Producto (SKU)</div>
      <Input inputMode="numeric" placeholder="Ej. 22" value={filters.idProducto} onChange={(e)=>setFilters({...filters, idProducto:e.target.value})} />
    </div>
  </div>

  <div className="flex gap-2">
    <Button onClick={()=>setFilters({estado:"Disponible", talla:"", marca:"", genero:"", categoriaId:"", idProducto:""})}>
      Limpiar
    </Button>
    <div className="text-sm text-neutral-600 self-center">
      Mostrando {sorted.length} de {products.length}
    </div>
  </div>
</section>

<section className="space-y-3">
        <div className="font-semibold">Listado ({products.length})</div>
        <div className="grid gap-3">
          {sorted.map(p => (
            <div key={p.id} className="rounded-2xl border p-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-neutral-500">{p.category.name}</div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm">Q{p.priceQ} · {p.status === "AVAILABLE" ? "Disponible" : "Vendido"}</div>
                <div className="text-xs text-neutral-600">SKU: {p.externalId ?? "-"} · Slug: {p.slug}</div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2">
                  <button className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
                    onClick={() => setForm({
                      id: p.id,
                      externalId: p.externalId?.toString() ?? "",
                      name: p.name,
                      priceQ: p.priceQ.toString(),
                      categoryId: p.categoryId,
                      brand: p.brand ?? "",
                      size: p.size ?? "",
                      color: p.color ?? "",
                      condition: p.condition?.toString() ?? "",
                      gender: p.gender ?? "",
                      isActive: p.isActive,
                    })}
                  >
                    Editar
                  </button>
                  <button className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
                    onClick={() => del(p.id)}
                  >
                    Eliminar
                  </button>
                </div>

                {p.status === "AVAILABLE" ? (
                  <div className="flex gap-2">
                    <button className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
                      onClick={() => setStatus(p.id, "RESERVED")}
                    >
                      Reservar
                    </button>
                    <button className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
                      onClick={() => setStatus(p.id, "SOLD")}
                    >
                      Marcar vendido
                    </button>
                  </div>
                ) : p.status === "RESERVED" ? (
                  <div className="flex gap-2">
                    <button className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
                      onClick={() => setStatus(p.id, "AVAILABLE")}
                    >
                      Quitar reserva
                    </button>
                    <button className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
                      onClick={() => setStatus(p.id, "SOLD")}
                    >
                      Vender
                    </button>
                  </div>
                ) : (
                  <button className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
                    onClick={() => setStatus(p.id, "AVAILABLE")}
                  >
                    Revertir a disponible
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
