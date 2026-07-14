"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ShoppingBag, History, User, UtensilsCrossed } from "lucide-react";

const navLinks = [
  { label: "Viandas", href: "/viandas-corporativas" },
  { label: "Eventos", href: "/eventos" },
  { label: "Menús", href: "/menus" },
  { label: "Cómo funciona", href: "/como-funciona" },
  {
    label: "Empresas",
    href: "/empresas",
    children: [
      { label: "Soluciones por perfil", href: "/empresas/soluciones" },
      { label: "Degustaciones", href: "/degustaciones" },
      { label: "Preguntas frecuentes", href: "/faq" },
    ],
  },
  { label: "Contacto", href: "/contacto" },
  {
    label: "Bengal",
    href: "/",
    children: [
      { label: "La casa — historia y próximamente", href: "/" },
      { label: "Bengal Delivery", href: "/delivery" },
      { label: "Bengal Catering", href: "/catering" },
    ],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isPortal = pathname?.startsWith("/pedidos") || pathname?.startsWith("/panel") || pathname?.startsWith("/mi-cuenta") || pathname?.startsWith("/historial");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Pantallas con chrome propio: cocina (fullscreen) y las páginas de marca (portada, delivery, catering)
  if (pathname?.startsWith("/cocina") || pathname === "/" || pathname?.startsWith("/delivery") || pathname?.startsWith("/catering")) return null;

  if (isPortal) return <PortalNav />;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-200"
          : "bg-gradient-to-b from-black/40 to-transparent"
      }`}
    >
      <div className="container-xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>B</span>
            </div>
            <span
              className={`text-xl font-semibold tracking-tight transition-colors ${scrolled ? "text-graphite-800" : "text-white drop-shadow-sm"}`}
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Bengal <span className={scrolled ? "text-terracotta-500" : "text-terracotta-300"}>Empresas</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      scrolled
                        ? "text-graphite-700 hover:bg-cream-200 hover:text-terracotta-600"
                        : "text-white/90 hover:text-white hover:bg-white/15 drop-shadow-sm"
                    }`}
                    onMouseEnter={() => setDropdown(link.label)}
                    onMouseLeave={() => setDropdown(null)}
                  >
                    {link.label}
                    <ChevronDown size={14} />
                  </button>
                  {dropdown === link.label && (
                    <div
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-cream-200 py-2 min-w-48"
                      onMouseEnter={() => setDropdown(link.label)}
                      onMouseLeave={() => setDropdown(null)}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-graphite-700 hover:bg-cream-100 hover:text-terracotta-600 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? scrolled ? "text-terracotta-600 bg-terracotta-50" : "text-white bg-white/20"
                      : scrolled
                        ? "text-graphite-700 hover:bg-cream-200 hover:text-terracotta-600"
                        : "text-white/90 hover:text-white hover:bg-white/15 drop-shadow-sm"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors px-3 py-2 ${
                scrolled ? "text-graphite-700 hover:text-terracotta-600" : "text-white/90 hover:text-white drop-shadow-sm"
              }`}
            >
              Ingresar
            </Link>
            <Link
              href="/degustaciones"
              className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-lg hover:bg-terracotta-600 transition-all hover:-translate-y-px"
            >
              Solicitar degustación
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? "text-graphite-700 hover:bg-cream-200" : "text-white hover:bg-white/15"
            }`}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-cream-200 shadow-lg">
          <div className="container-xl py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-cream-100 hover:text-terracotta-600 ${
                    pathname === link.href ? "text-terracotta-600 bg-terracotta-50" : "text-graphite-700"
                  }`}
                >
                  {link.label}
                </Link>
                {link.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-8 py-2 text-sm text-warm-500 hover:text-terracotta-600 transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="mt-2 pt-4 border-t border-cream-200 flex flex-col gap-2">
              <Link href="/login" className="px-4 py-3 text-sm font-medium text-graphite-700 hover:text-terracotta-600">
                Ingresar al portal
              </Link>
              <Link
                href="/degustaciones"
                className="mx-4 py-3 bg-terracotta-500 text-white text-sm font-semibold rounded-lg text-center hover:bg-terracotta-600 transition-colors"
              >
                Solicitar degustación gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Tab inferior para el portal (mobile) ─────────────────────────────────────
function PortalBottomTab({
  href, icon, label,
}: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
        active ? "text-terracotta-600" : "text-warm-400 hover:text-graphite-700"
      }`}
    >
      <span className={`transition-transform ${active ? "scale-110" : ""}`}>{icon}</span>
      <span className={`text-[10px] font-semibold ${active ? "text-terracotta-600" : "text-warm-400"}`}>
        {label}
      </span>
      {active && <span className="absolute bottom-0 w-8 h-0.5 bg-terracotta-500 rounded-full" />}
    </Link>
  );
}

function PortalNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-cream-200 sticky top-0 z-50 shadow-sm">
        <div className="container-xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-terracotta-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>B</span>
              </div>
              <span className="font-semibold text-graphite-800 hidden sm:block" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Bengal <span className="text-terracotta-500">Empresas</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Hacer pedido", href: "/pedidos" },
                { label: "Historial",    href: "/historial" },
                { label: "Mi cuenta",    href: "/mi-cuenta" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-terracotta-50 text-terracotta-600"
                      : "text-graphite-600 hover:bg-cream-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <Link
              href="/pedidos"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-lg hover:bg-terracotta-600 transition-colors"
            >
              <ShoppingBag size={15} /> Pedir ahora
            </Link>

            {/* Mobile: avatar / link a cuenta */}
            <Link
              href="/mi-cuenta"
              className="md:hidden w-8 h-8 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600"
            >
              <User size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom tab bar — sólo mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-cream-200 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-3 relative">
          <PortalBottomTab href="/pedidos"  icon={<UtensilsCrossed size={20} />} label="Pedir" />
          <PortalBottomTab href="/historial" icon={<History size={20} />}         label="Historial" />
          <PortalBottomTab href="/mi-cuenta" icon={<User size={20} />}            label="Mi cuenta" />
        </div>
      </nav>
    </>
  );
}
