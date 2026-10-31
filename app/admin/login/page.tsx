"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";
import { AlertCircle, Lock } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      window.location.href = "/admin";
      return;
    }
    setMsg(await res.text());
    setLoading(false);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo + título */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center"
            style={{ background: "#14532d" }}
          >
            <svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 32 C22 32 9 24 9 14 C9 8 14.5 6 22 9.5 Z" fill="#4ade80"/>
              <path d="M22 32 C22 32 35 24 35 14 C35 8 29.5 6 22 9.5 Z" fill="#86efac"/>
              <path d="M22 9.5 L22 34" stroke="#d1fae5" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-center">
            <div className="text-xl font-black tracking-tight text-[#14532d]">GGStore</div>
            <div className="text-sm text-neutral-500 mt-0.5">Panel Administrativo</div>
          </div>
        </div>

        {/* Card */}
        <div className="gg-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 pb-1">
            <Lock size={14} className="text-[#14532d]" /> Iniciar sesión
          </div>

          <Input
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          <Button
            variant="primary"
            onClick={submit}
            disabled={loading || !email || !password}
            className="w-full justify-center"
          >
            {loading ? "Verificando..." : "Entrar"}
          </Button>

          {msg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={14} className="shrink-0" /> {msg}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
