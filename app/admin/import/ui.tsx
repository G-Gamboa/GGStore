"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import Link from "next/link";

export default function ImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"skip" | "upsert">("skip");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!file) return;
    setLoading(true);
    setMsg(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", mode);

    const res = await fetch("/api/admin/import", { method: "POST", body: fd });
    const text = await res.text();
    setLoading(false);

    if (!res.ok) {
      setMsg(text || "Error en import.");
      return;
    }
    setMsg(text);
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="gg-button gg-button-ghost">← Admin</Link>
      <h1 className="text-2xl font-semibold">Importar productos</h1>

      <div className="rounded-2xl border p-5 space-y-4 max-w-2xl">
        <div className="text-sm text-neutral-700">
          Sube un archivo <b>TSV</b> (tabs) o <b>CSV</b> (coma o punto y coma). Encabezados soportados:
          <div className="mt-2 rounded-xl border bg-neutral-50 p-3 text-xs overflow-auto">
            Id,Nombre,Descripcion,Precio,Categoria,Marca,Talla,Color,EstadoPrenda,Estado,ImagenUrl,FechaCreacion,FechaVenta,Genero
          </div>
        </div>

        <input
          type="file"
          accept=".csv,.tsv,text/csv,text/tab-separated-values"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div className="text-sm">
          <div className="font-medium mb-2">Modo</div>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "skip"} onChange={() => setMode("skip")} />
            <span>Skip duplicados por <code>Id</code> (externalId)</span>
          </label>
          <label className="flex items-center gap-2 mt-2">
            <input type="radio" checked={mode === "upsert"} onChange={() => setMode("upsert")} />
            <span>Upsert por <code>Id</code> (actualiza si ya existe)</span>
          </label>
        </div>

        <Button onClick={run} disabled={!file || loading}>
          {loading ? "Importando..." : "Importar"}
        </Button>

        {msg ? <div className="text-sm text-neutral-700 whitespace-pre-wrap">{msg}</div> : null}
      </div>
    </div>
  );
}
