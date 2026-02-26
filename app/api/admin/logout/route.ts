import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const url = new URL(req.url);

  // Redirigir al home
  const res = NextResponse.redirect(new URL("/", url), { status: 303 });

  // Borrar cookie (ajusta el nombre si usas otro)
  res.cookies.set("ggs_session", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 0,
  });

  return res;
}