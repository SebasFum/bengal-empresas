import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CUSTOMER_ROLES = new Set(["empresa", "hogar", "eventos", "employee", "company_admin"]);
const KITCHEN_ROLES = new Set(["cocina"]);
const ADMIN_ROLES = new Set(["admin"]);

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Si ya está logueado e intenta ir al login → redirigir según rol
  if (pathname === "/login" && user) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role ?? "empresa";
    const dest = request.nextUrl.clone();
    if (KITCHEN_ROLES.has(role)) dest.pathname = "/cocina";
    else if (ADMIN_ROLES.has(role)) dest.pathname = "/panel-admin";
    else dest.pathname = "/pedidos";
    return NextResponse.redirect(dest);
  }

  // Rutas protegidas por autenticación
  const protectedPaths = [
    "/pedidos", "/historial", "/mi-cuenta",
    "/panel-empresa", "/panel-admin", "/cocina",
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protección por rol (solo verificar si hay usuario logueado en rutas sensibles)
  if (user && (pathname.startsWith("/cocina") || pathname.startsWith("/panel-admin"))) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role ?? "empresa";

    if (pathname.startsWith("/cocina") && !KITCHEN_ROLES.has(role) && !ADMIN_ROLES.has(role)) {
      const dest = request.nextUrl.clone();
      dest.pathname = "/pedidos";
      return NextResponse.redirect(dest);
    }

    if (pathname.startsWith("/panel-admin") && !ADMIN_ROLES.has(role)) {
      const dest = request.nextUrl.clone();
      dest.pathname = "/pedidos";
      return NextResponse.redirect(dest);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
