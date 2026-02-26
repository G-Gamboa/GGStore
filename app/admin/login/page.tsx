"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";

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
    <div className="max-w-md space-y-4 rounded-2xl border p-6">
      <h1 className="text-xl font-semibold">Login Admin</h1>
      <Input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <Input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      <Button onClick={submit} disabled={loading || !email || !password}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      {msg ? <div className="text-sm text-red-600">{msg}</div> : null}
    </div>
  );
}
