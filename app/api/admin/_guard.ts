import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function requireAdminApi(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "ggs_session";
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;

  const tokenHash = sha256(token);
  const session = await prisma.session.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;
  return session.user;
}
