import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "ggs_session";
  const token = req.cookies.get(cookieName)?.value;

  if (token) {
    const tokenHash = sha256(token);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }

  return new Response("OK", {
    status: 200,
    headers: {
      "Set-Cookie": `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      "Location": "/admin/login",
    },
  });
}
