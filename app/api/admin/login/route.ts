import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) return new Response("Missing credentials", { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: String(body.email).toLowerCase().trim() } });
  if (!user) return new Response("Credenciales inválidas", { status: 401 });

  const ok = await bcrypt.compare(String(body.password), user.passwordHash);
  if (!ok) return new Response("Credenciales inválidas", { status: 401 });

  const days = Number(process.env.SESSION_DAYS || "30");
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(token);

  await prisma.session.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  const cookieName = process.env.COOKIE_NAME || "ggs_session";

  return new Response("OK", {
    status: 200,
    headers: {
      "Set-Cookie": `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${days * 24 * 60 * 60}`,
    },
  });
}
