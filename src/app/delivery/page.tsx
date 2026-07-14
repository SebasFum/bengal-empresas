import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cormorant, jost } from "@/lib/brand-fonts";
import { getDeliveryMenus } from "@/lib/db-delivery";
import DeliveryStore from "./DeliveryStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bengal Delivery — La cocina de Bengal, en tu mesa",
  description:
    "Los clásicos de Bengal a domicilio: milanesas, tapeos, tortillas y más. Pedí online y recibilo en tu casa.",
};

export default async function DeliveryPage() {
  const menus = await getDeliveryMenus();

  return (
    <div
      className={`${cormorant.variable} ${jost.variable} bg-[#0B0A09] text-[#EDE6DA] min-h-screen`}
      style={{ fontFamily: "var(--font-jost), sans-serif" }}
    >
      {/* ── Nav de marca ── */}
      <header className="sticky top-0 z-50 bg-[#0B0A09]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg tracking-[0.35em] font-light hover:text-[#C9A45C] transition-colors"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            BENGAL
          </Link>
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#C9A45C]">Delivery</span>
          <nav className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-[#B7AD9C]">
            <Link href="/" className="hidden sm:inline-flex items-center gap-2 hover:text-[#C9A45C] transition-colors">
              <ArrowLeft size={12} /> La casa
            </Link>
            <Link href="/empresas" className="hidden sm:inline hover:text-[#C9A45C] transition-colors">
              Empresas
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero compacto ── */}
      <section className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,92,0.10),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-5 lg:px-10 py-14 md:py-20 text-center">
          <h1
            className="font-light leading-tight text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            La cocina de Bengal, <span className="italic text-[#C9A45C]">en tu mesa</span>
          </h1>
          <p className="mt-4 text-[#B7AD9C] font-light max-w-lg mx-auto">
            Elegí, sumá al pedido y te lo llevamos. Así de simple.
          </p>
        </div>
      </section>

      {/* ── Tienda ── */}
      <DeliveryStore menus={menus} />

      {/* ── Footer de marca ── */}
      <footer className="border-t border-white/5 mt-24">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 py-12 pb-32 flex flex-col md:flex-row items-center justify-between gap-5">
          <Link
            href="/"
            className="text-lg tracking-[0.35em] font-light hover:text-[#C9A45C] transition-colors"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            BENGAL
          </Link>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#B7AD9C]/70">
            Pilar y alrededores · consultá tu zona
          </p>
          <a
            href="mailto:hola@bengalrestaurante.com.ar"
            className="text-[11px] uppercase tracking-[0.25em] text-[#B7AD9C] hover:text-[#C9A45C] transition-colors"
          >
            hola@bengalrestaurante.com.ar
          </a>
        </div>
      </footer>
    </div>
  );
}
