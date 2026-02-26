"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "@/components/ui";

type Category = { id: string; name: string; slug: string };

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

export default function ProductsListClient() {
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

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/overview");
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setCategories(data.categories);
    setProducts(data.products);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((e) => setMsg(String(e)));
  }, []);

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

  const sorted = useMemo(
    () => [...filtered].sort((a,b)=> (a.status === b.status ? b.priceQ - a.priceQ : (a.status === "AVAILABLE" ? -1 : (a.status === "RESERVED" ? 0 : 1)))),
    [filtered]
  );

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      {msg ? <div className="rounded-xl border p-3 text-sm text-red-600">{msg}</div> : null}

      <section className="rounded-2xl border p-5 space-y-4">
        <div className="font-semibold">Filtros</div>

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

        <div className="flex gap-2 items-center">
          <Button onClick={()=>setFilters({estado:"Disponible", talla:"", marca:"", genero:"", categoriaId:"", idProducto:""})}>
            Limpiar
          </Button>
          <div className="text-sm text-neutral-600">
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
                <div className="text-sm">Q{p.priceQ} · {p.status === "AVAILABLE" ? "Disponible" : p.status === "RESERVED" ? "Reservado" : "Vendido"}</div>
                <div className="text-xs text-neutral-600">SKU: {p.externalId ?? "-"} · Slug: {p.slug}</div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2">
                  <Link
                    className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
                    href={`/admin/products/edit/${encodeURIComponent(p.id)}`}
                  >
                    Editar
                  </Link>

                  <button
                    className="gg-button gg-button-ghost inline-flex items-center gap-2 text-sm px-3 py-2"
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