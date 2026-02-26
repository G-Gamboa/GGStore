"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";

type Category = { id: string; name: string; slug: string };

export default function CategoriesClient() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/categories");
    if (!res.ok) throw new Error(await res.text());
    setItems(await res.json());
  }

  useEffect(() => { load().catch(e=>setMsg(String(e))); }, []);

  async function create() {
    setMsg(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) { setMsg(await res.text()); return; }
    setName("");
    await load();
  }

  async function del(id: string) {
    setMsg(null);
    const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) { setMsg(await res.text()); return; }
    await load();
  }

  return (
    
    <div className="space-y-6">
                                <Link href="/admin" className="gg-button gg-button-ghost">← Admin</Link>
                      <h1 className="text-2xl font-semibold">Categorías</h1>
      {msg ? <div className="rounded-xl border p-3 text-sm text-red-600">{msg}</div> : null}

      <div className="rounded-2xl border p-5 space-y-3 max-w-lg">
        <div className="font-semibold">Nueva categoría</div>
        <Input placeholder="Nombre" value={name} onChange={(e)=>setName(e.target.value)} />
        <Button onClick={create} disabled={!name.trim()}>Crear</Button>
      </div>

      <div className="grid gap-2 max-w-lg">
        {items.map(c => (
          <div key={c.id} className="rounded-2xl border p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-neutral-600">/{c.slug}</div>
            </div>
            <button className="text-sm underline" onClick={()=>del(c.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
