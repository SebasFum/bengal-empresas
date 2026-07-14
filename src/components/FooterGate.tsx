"use client";

import { usePathname } from "next/navigation";

// Oculta el footer en pantallas con chrome propio: cocina, portada de marca, delivery y catering
export default function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/cocina") || pathname === "/" || pathname?.startsWith("/delivery") || pathname?.startsWith("/catering")) return null;
  return <>{children}</>;
}
