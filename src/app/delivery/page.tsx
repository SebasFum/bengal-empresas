import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cormorant, jost } from "@/lib/brand-fonts";

export const metadata = {
  title: "Bengal Delivery — La cocina de Bengal, en tu mesa",
  description:
    "Los clásicos de Bengal a domicilio: curries legendarios, cocina mediterránea y los platos de siempre. Pedí online o por WhatsApp.",
};

const clasicos = [
  { name: "Rogan Josh", desc: "Curry de cordero con arroz basmati — el plato que hizo escuela." },
  { name: "Pollo Bengalí", desc: "Curry de pollo con arroz a la india, la firma de la casa." },
  { name: "Langostinos en leche de coco", desc: "El mar, a la manera de Bengal." },
  { name: "Dal Makhani", desc: "Curry de lentejas, cremoso y profundo." },
  { name: "Cocina mediterránea", desc: "Pastas, risottos y los clásicos italianos de siempre." },
  { name: "Menú del día", desc: "La carta viva: lo que sale de la cocina hoy." },
];

const pasos = [
  { n: "I", title: "Mirá la carta", text: "La carta completa está online, con fotos y precios al día." },
  { n: "II", title: "Hacé tu pedido", text: "Desde el portal en tres clics, o por WhatsApp si preferís hablar con alguien." },
  { n: "III", title: "Recibilo en casa", text: "Sale de nuestra cocina y llega a tu mesa, en temperatura y a tiempo." },
];

export default function DeliveryPage() {
  return (
    <div
      className={`${cormorant.variable} ${jost.variable} bg-[#0B0A09] text-[#EDE6DA] min-h-screen`}
      style={{ fontFamily: "var(--font-jost), sans-serif" }}
    >
      {/* ── Nav de marca ── */}
      <header className="absolute top-0 left-0 right-0 z-40">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl tracking-[0.35em] font-light hover:text-[#C9A45C] transition-colors" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            BENGAL
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] text-[#B7AD9C]">
            <Link href="/" className="hover:text-[#C9A45C] transition-colors inline-flex items-center gap-2">
              <ArrowLeft size={12} /> La casa
            </Link>
            <Link href="/menus" className="hover:text-[#C9A45C] transition-colors">Carta</Link>
            <Link href="/empresas" className="hover:text-[#C9A45C] transition-colors">Empresas</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.08),transparent_60%)]" />
        <p className="relative text-[11px] uppercase tracking-[0.45em] text-[#C9A45C] mb-8">Bengal Delivery</p>
        <h1
          className="relative font-light leading-[1.05] text-[clamp(2.8rem,7vw,5.5rem)]"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          La cocina de Bengal,<br />
          <span className="italic text-[#C9A45C]">en tu mesa</span>
        </h1>
        <div className="relative h-px w-24 bg-[#C9A45C]/60 my-10" />
        <p className="relative max-w-xl text-[#B7AD9C] text-base md:text-lg font-light leading-relaxed">
          Cuando el salón cerró, la cocina no. Desde entonces los clásicos de Bengal viajan
          a domicilio — como en el restaurante, pero en tu casa.
        </p>
        <div className="relative mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/menus"
            className="px-8 py-3.5 bg-[#C9A45C] text-[#0B0A09] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-[#D8B76F] transition-colors"
          >
            Ver la carta
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 border border-[#C9A45C]/50 text-[#C9A45C] text-[11px] uppercase tracking-[0.3em] hover:bg-[#C9A45C] hover:text-[#0B0A09] transition-all duration-300"
          >
            Pedir online
          </Link>
        </div>
      </section>

      {/* ── LOS CLÁSICOS ── */}
      <section className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A45C] mb-4 text-center">Los de siempre</p>
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            Clásicos que hicieron historia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {clasicos.map((c) => (
              <div key={c.name} className="bg-[#0B0A09] p-8 hover:bg-[#12100D] transition-colors">
                <h3 className="text-xl mb-2 font-normal" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  {c.name}
                </h3>
                <p className="text-[#B7AD9C] font-light text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-10">
            <Link href="/menus" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[#C9A45C] hover:gap-4 transition-all">
              La carta completa <ArrowRight size={13} />
            </Link>
          </p>
        </div>
      </section>

      {/* ── CÓMO PEDIR ── */}
      <section className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A45C] mb-16 text-center">Cómo pedir</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {pasos.map((p) => (
              <div key={p.n} className="text-center">
                <div className="text-4xl text-[#C9A45C] font-light mb-5" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  {p.n}
                </div>
                <h3 className="text-lg mb-3 font-normal tracking-wide" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  {p.title}
                </h3>
                <p className="text-[#B7AD9C] font-light text-sm leading-relaxed max-w-xs mx-auto">{p.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center border border-white/10 py-14 px-6">
            <p className="text-[#B7AD9C] font-light mb-2">Zona de entrega</p>
            <p className="text-xl font-light mb-8" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              Pilar y alrededores — consultanos por tu zona
            </p>
            <a
              href="https://wa.me/5491100000000?text=Hola%20Bengal%2C%20quiero%20hacer%20un%20pedido%20a%20domicilio"
              className="inline-block px-8 py-3.5 border border-[#C9A45C]/50 text-[#C9A45C] text-[11px] uppercase tracking-[0.3em] hover:bg-[#C9A45C] hover:text-[#0B0A09] transition-all duration-300"
            >
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER de marca ── */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="text-lg tracking-[0.35em] font-light hover:text-[#C9A45C] transition-colors" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            BENGAL
          </Link>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#B7AD9C]/70">
            Buenos Aires · desde 1995
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
