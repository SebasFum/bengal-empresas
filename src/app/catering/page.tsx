import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cormorant, jost } from "@/lib/brand-fonts";
import CateringQuoteForm from "./CateringQuoteForm";

export const metadata = {
  title: "Bengal Catering — Eventos, desayunos y coffee breaks desde 20 comensales",
  description:
    "La mesa de Bengal en tu evento: desayunos corporativos, tés, coffee breaks, almuerzos ejecutivos, after office y celebraciones. Logística profesional, cocina con historia. Desde 20 comensales.",
};

const servicios = [
  {
    name: "Desayunos corporativos",
    desc: "Viennoiserie, frutas frescas, yogur con granola y café en serio. El día arranca distinto cuando la mesa está bien puesta.",
  },
  {
    name: "Coffee breaks & tés",
    desc: "Pausas que reactivan cualquier reunión: dulce, salado y bebidas calientes en servicio continuo, sin que nadie tenga que ocuparse.",
  },
  {
    name: "Almuerzos ejecutivos",
    desc: "Menús emplatados para directorio, clientes y visitas que hay que impresionar. Presentación de restaurante, en tu oficina.",
  },
  {
    name: "Eventos corporativos",
    desc: "Family Day, fin de año, lanzamientos, aniversarios. De la propuesta al desmontaje, nos ocupamos de punta a punta.",
  },
  {
    name: "After office & cocktail",
    desc: "Finger food, tapeos de la casa y barra. La forma elegante de cerrar el día en alto con el equipo.",
  },
  {
    name: "Celebraciones privadas",
    desc: "Cumpleaños, reuniones familiares y fiestas en casa. El servicio completo de Bengal, puertas adentro.",
  },
];

const pasos = [
  { n: "I", title: "Contanos tu evento", text: "Por WhatsApp o con el formulario: ocasión, fecha, cantidad de comensales y estilo." },
  { n: "II", title: "Propuesta en 48 hs", text: "Menú, servicio, staff y logística, con precios claros y sin letra chica." },
  { n: "III", title: "Degustación", text: "Para eventos grandes, probás antes de decidir. La mesa convence más que cualquier PDF." },
  { n: "IV", title: "El gran día", text: "Montaje, servicio y desmontaje a cargo nuestro. Vos, de invitado en tu propio evento." },
];

export default function CateringPage() {
  return (
    <div
      className={`${cormorant.variable} ${jost.variable} bg-[#0B0A09] text-[#EDE6DA] min-h-screen`}
      style={{ fontFamily: "var(--font-jost), sans-serif" }}
    >
      {/* ── Nav de marca ── */}
      <header className="absolute top-0 left-0 right-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-10 h-20 flex items-center justify-between gap-3">
          <Link href="/" className="text-lg md:text-xl tracking-[0.35em] font-light hover:text-[#C9A45C] transition-colors flex-shrink-0" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            BENGAL
          </Link>
          <nav className="flex items-center gap-4 md:gap-8 text-[10px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.25em] text-[#B7AD9C] overflow-x-auto scrollbar-hide">
            <Link href="/" className="hover:text-[#C9A45C] transition-colors inline-flex items-center gap-2 whitespace-nowrap">
              <ArrowLeft size={12} /> La casa
            </Link>
            <a href="#cotizar" className="hidden md:inline hover:text-[#C9A45C] transition-colors">Cotizar</a>
            <Link href="/empresas" className="hover:text-[#C9A45C] transition-colors whitespace-nowrap">Empresas</Link>
            <Link href="/delivery" className="hover:text-[#C9A45C] transition-colors whitespace-nowrap">Delivery</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.08),transparent_60%)]" />
        <p className="relative text-[11px] uppercase tracking-[0.45em] text-[#C9A45C] mb-8">Bengal Catering</p>
        <h1
          className="relative font-light leading-[1.05] text-[clamp(2.8rem,7vw,5.5rem)]"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          Tu evento,<br />
          <span className="italic text-[#C9A45C]">con la mesa de Bengal</span>
        </h1>
        <div className="relative h-px w-24 bg-[#C9A45C]/60 my-10" />
        <p className="relative max-w-xl text-[#B7AD9C] text-base md:text-lg font-light leading-relaxed">
          Desayunos, tés, coffee breaks, almuerzos ejecutivos y celebraciones.
          La cocina de una casa con treinta años de historia, con la logística
          de una operación profesional. Desde 20 comensales.
        </p>
        <div className="relative mt-12 flex flex-wrap justify-center gap-4">
          <a
            href="#cotizar"
            className="px-8 py-3.5 bg-[#C9A45C] text-[#0B0A09] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-[#D8B76F] transition-colors"
          >
            Cotizar mi evento
          </a>
          <a
            href="#servicios"
            className="px-8 py-3.5 border border-[#C9A45C]/50 text-[#C9A45C] text-[11px] uppercase tracking-[0.3em] hover:bg-[#C9A45C] hover:text-[#0B0A09] transition-all duration-300"
          >
            Ver servicios
          </a>
        </div>
      </section>

      {/* ── Cifras ── */}
      <section className="border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12 grid grid-cols-3 gap-6 text-center">
          {[
            { v: "20+", l: "comensales, sin techo" },
            { v: "48 hs", l: "para tu propuesta" },
            { v: "30 años", l: "de mesa servida" },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-3xl md:text-4xl font-light text-[#C9A45C]" style={{ fontFamily: "var(--font-cormorant), serif" }}>{s.v}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#B7AD9C]/70 mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="border-t border-white/5 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A45C] mb-4 text-center">Servicios</p>
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            Un servicio para cada ocasión
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {servicios.map((s) => (
              <div key={s.name} className="bg-[#0B0A09] p-8 hover:bg-[#12100D] transition-colors">
                <h3 className="text-xl mb-2 font-normal" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  {s.name}
                </h3>
                <p className="text-[#B7AD9C] font-light text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO TRABAJAMOS ── */}
      <section className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A45C] mb-16 text-center">Cómo trabajamos</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
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
        </div>
      </section>

      {/* ── COTIZAR ── */}
      <section id="cotizar" className="relative border-t border-white/5 overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.08),transparent_55%)]" />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A45C] mb-4 text-center">Cotizá tu evento</p>
          <h2 className="text-3xl md:text-4xl font-light text-center mb-4" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            Contanos qué estás imaginando
          </h2>
          <p className="text-[#B7AD9C] font-light text-center max-w-lg mx-auto mb-14">
            Con estos datos armamos una propuesta a medida en 48 horas hábiles.
          </p>
          <CateringQuoteForm />
        </div>
      </section>

      {/* ── Cross-link a las otras unidades ── */}
      <section className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16 flex flex-col md:flex-row items-center justify-center gap-8 text-center">
          <Link href="/empresas" className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#B7AD9C] hover:text-[#C9A45C] transition-colors">
            ¿Viandas diarias para tu equipo? Bengal Empresas <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className="hidden md:block h-4 w-px bg-white/10" />
          <Link href="/delivery" className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#B7AD9C] hover:text-[#C9A45C] transition-colors">
            ¿Los clásicos en tu casa? Bengal Delivery <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
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
