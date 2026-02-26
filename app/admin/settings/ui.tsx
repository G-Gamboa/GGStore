"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import Link from "next/link";

export default function SettingsForm({ initial }: { initial: { showSoldPublic: boolean; trackStock: boolean } }) {
  const [showSoldPublic, setShowSoldPublic] = useState(initial.showSoldPublic);
  const [trackStock, setTrackStock] = useState(initial.trackStock);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ showSoldPublic, trackStock }),
    });
    if (!res.ok) {
      setMsg(await res.text());
      return;
    }
    setMsg("Guardado.");
  }

  return (
    <div className="rounded-2xl border p-5 space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showSoldPublic} onChange={(e)=>setShowSoldPublic(e.target.checked)} />
        Mostrar productos VENDIDOS en catálogo público
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={trackStock} onChange={(e)=>setTrackStock(e.target.checked)} />
        Modo stock (si desactivado, se usa Disponible/Vendido)
      </label>

      <Button onClick={save}>Guardar</Button>
      {msg ? <div className="text-sm text-neutral-600">{msg}</div> : null}
    </div>
  );
}
