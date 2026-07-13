"use client";

import { usePathname } from "next/navigation";

// Oculta el footer en pantallas con chrome propio: cocina, portada de marca y delivery
export default function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/cocina") || pathname === "/" || pathname?.startsWith("/delivery")) return null;
  return <>{children}</>;
}
