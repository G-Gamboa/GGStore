"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "@/components/ui";

type Category = { id: string; name: string; slug: string };

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dk7aiheee";
const CLOUDINARY_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER ?? "ggstore";

type FormState = {
  id: string;
  externalId: string;
  name: string;
  priceQ: string;
  categoryId: string;
  brand: string;
  size: string;
  color: string;
  condition: string;
  gender: string;
  isActive: boolean;
};

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

export default function ProductFormClient({ mode, id }: { mode: "create" | "edit"; id?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
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

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/overview");
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setCategories(data.categories);
    setProducts(data.products);
    setLoading(false);
    return data;
  }

  useEffect(() => {
    load()
      .then((data) => {
        const cat0 = data.categories[0]?.id || "";

        if (mode === "create") {
          setForm((f) => ({ ...f, categoryId: cat0 }));
          return;
        }

        const p = (data.products as Product[]).find((x) => x.id === id);
        if (!p) {
          setMsg("No encontré el producto a editar. Regresa al listado.");
          return;
        }

        setForm({
          id: p.id,
          externalId: p.externalId?.toString() ?? "",
          name: p.name,
          priceQ: p.priceQ.toString(),
          categoryId: p.categoryId || cat0,
          brand: p.brand ?? "",
          size: p.size ?? "",
          color: p.color ?? "",
          condition: p.condition?.toString() ?? "",
          gender: p.gender ?? "",
          isActive: p.isActive,
        });
      })
      .catch((e) => setMsg(String(e)));
  }, [mode, id]);

  const isEditing = mode === "edit";

  async function save() {
    setMsg(null);

    if (!String(form.externalId || "").trim()) { setMsg("Debes ingresar el ID (externalId)."); return; }
    if (!String(form.name || "").trim()) { setMsg("Debes ingresar el nombre."); return; }
    if (!String(form.priceQ || "").trim()) { setMsg("Debes ingresar el precio."); return; }

    const payload = {
      id: isEditing ? form.id : undefined,
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

    window.location.href = "/admin/products";
  }

  const imgName = useMemo(() => `P_${String(form.externalId || "").trim()}`, [form.externalId]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{isEditing ? "Editar producto" : "Nuevo producto"}</h1>
          <p className="text-sm text-neutral-600">Formulario dedicado.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="gg-button gg-button-ghost">← Volver</Link>
        </div>
      </div>

      {msg ? <div className="rounded-xl border p-3 text-sm text-red-600">{msg}</div> : null}

      <section className="grid gap-3 rounded-2xl border p-5">
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
                Se genera como <span className="font-mono">{imgName}</span>
              </div>
            </div>
            <div className="h-16 w-16 overflow-hidden rounded-xl border" style={{ borderColor: "var(--gg-border)" }}>
              {String(form.externalId || "").trim() ? (
                <img
                  src={`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto,w_240,c_limit/${CLOUDINARY_FOLDER}/${imgName}`}
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
          <Button onClick={save}>{isEditing ? "Guardar cambios" : "Crear"}</Button>
          <Link href="/admin/products" className="gg-button gg-button-ghost inline-flex items-center">Cancelar</Link>
        </div>
      </section>
    </div>
  );
}