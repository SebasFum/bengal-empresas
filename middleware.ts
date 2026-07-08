import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const KITCHEN_ROLES = new Set(["cocina"]);
const ADMIN_ROLES   = new Set(["admin"]);
const PROTECTED     = ["/pedidos", "/historial", "/mi-cuenta", "/panel-empresa", "/panel-admin", "/cocina"];

export default auth((req) => {
  const session  = req.auth;
  const user     = session?.user;
  const role     = user?.role ?? "";
  const pathname = req.nextUrl.pathname;

  // Ya logueado e intenta ir al login → redirigir según rol
  if (pathname === "/login" && user) {
    const dest = req.nextUrl.clone();
    if (KITCHEN_ROLES.has(role))     dest.pathname = "/cocina";
    else if (ADMIN_ROLES.has(role))  dest.pathname = "/panel-admin";
    else                             dest.pathname = "/pedidos";
    return NextResponse.redirect(dest);
  }

  // Rutas protegidas sin sesión → login
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cocina: solo roles cocina/admin
  if (user && pathname.startsWith("/cocina") && !KITCHEN_ROLES.has(role) && !ADMIN_ROLES.has(role)) {
    return NextResponse.redirect(new URL("/pedidos", req.url));
  }

  // Panel admin: solo admin
  if (user && pathname.startsWith("/panel-admin") && !ADMIN_ROLES.has(role)) {
    return NextResponse.redirect(new URL("/pedidos", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
