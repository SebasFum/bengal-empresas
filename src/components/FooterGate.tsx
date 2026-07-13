"use client";

import { usePathname } from "next/navigation";

// Oculta el footer en pantallas fullscreen operativas (cocina)
export default function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/cocina")) return null;
  return <>{children}</>;
}
