import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { cormorant, jost } from "@/lib/brand-fonts";

export const metadata = {
  title: "BENGAL — Alta Gastronomía · Buenos Aires, desde 1995",
  description:
    "Del bistró de Plaza San Martín a Pilar Golf y los hoteles CasaSur. La casa pionera de la cocina india en Buenos Aires vuelve: nuevo local en construcción. Hoy, Bengal Empresas y Bengal Delivery.",
};

const hitos = [
  {
    year: "1995",
    title: "El origen",
    text: "En Arenales 837, frente a Plaza San Martín, la familia Escudero abre un bistró mediterráneo que pronto se vuelve un secreto a voces del centro porteño.",
  },
  {
    year: "2001",
    title: "La visita que lo cambió todo",
    text: "El Embajador de la India entra al salón y pregunta si sirven curry. Todavía no — pero la pregunta enciende algo: el Embajador presta su propio chef a la casa, y Bengal se convierte en pionero de la cocina india en Buenos Aires.",
  },
  {
    year: "2008",
    title: "Pilar Golf",
    text: "Los hermanos Marcelo, Marcela y Juan llevan Bengal al kilómetro 60 de Panamericana: cocina italiana e india de primer nivel en Pilar Golf Country Club.",
  },
  {
    year: "2014",
    title: "CasaSur",
    text: "Bengal desembarca en los hoteles boutique CasaSur — Recoleta y el Palacio Bellini de Palermo. Sus curries se vuelven referencia obligada de la ciudad.",
  },
  {
    year: "2020",
    title: "La llama encendida",
    text: "La pandemia cierra las puertas del salón, pero no las de la cocina. Bengal sigue presente en cada casa, con delivery y eventos que sostienen viva la marca.",
  },
  {
    year: "HOY",
    title: "El regreso",
    text: "Dos cocinas en marcha — Empresas y Delivery — y una noticia esperada: el nuevo local de Bengal ya está en construcción.",
  },
];

export default function BrandHomePage() {
  return (
    <div className={`${cormorant.variable} ${jost.variable} bg-[#0B0A09] text-[#EDE6DA] min-h-screen`}
      style={{ fontFamily: "var(--font-jost), sans-serif" }}>

      {/* ── Nav de marca ── */}
      <header className="absolute top-0 left-0 right-0 z-40">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <span className="text-xl tracking-[0.35em] font-light" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            BENGAL
          </span>
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] text-[#B7AD9C]">
            <a href="#historia" className="hover:text-[#C9A45C] transition-colors">Historia</a>
            <a href="#proximamente" className="hover:text-[#C9A45C] transition-colors">Próximamente</a>
            <Link href="/empresas" className="hover:text-[#C9A45C] transition-colors">Empresas</Link>
            <Link href="/delivery" className="hover:text-[#C9A45C] transition-colors">Delivery</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.08),transparent_60%)]" />
        <p className="relative text-[11px] uppercase tracking-[0.45em] text-[#C9A45C] mb-8">
          Buenos Aires · desde 1995
        </p>
        <h1
          className="relative font-light leading-none select-none text-[clamp(4.5rem,16vw,13rem)] tracking-[0.08em]"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          BENGAL
        </h1>
        <div className="relative h-px w-24 bg-[#C9A45C]/60 my-10" />
        <p className="relative max-w-xl text-[#B7AD9C] text-base md:text-lg font-light leading-relaxed">
          Del bistró de Plaza San Martín a Pilar Golf y los hoteles CasaSur.
          Treinta años de una cocina que nunca dejó de estar en la mesa de los que saben.
        </p>
        <a
          href="#historia"
          className="relative mt-14 inline-flex flex-col items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[#B7AD9C] hover:text-[#C9A45C] transition-colors"
        >
          La historia
          <ArrowDown size={14} className="animate-bounce" />
        </a>
      </section>

      {/* ── LA PREGUNTA (anécdota central) ── */}
      <section id="historia" className="border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-28 md:py-36 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A45C] mb-10">2001 · Plaza San Martín</p>
          <blockquote
            className="text-4xl md:text-6xl font-light italic leading-tight text-[#EDE6DA]"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            «¿Ustedes sirven curry?»
          </blockquote>
          <p className="mt-10 text-[#B7AD9C] font-light leading-relaxed max-w-2xl mx-auto">
            La pregunta la hizo el Embajador de la India, una noche cualquiera, en un bistró
            mediterráneo llamado Bengal. La respuesta era no — todavía. El Embajador les prestó su
            chef, la casa aprendió sus secretos, y Buenos Aires descubrió la cocina india por
            primera vez. Así, un apellido porteño — Escudero — terminó escribiendo un capítulo de
            la gastronomía de dos continentes.
          </p>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A45C] mb-16 text-center">Tres décadas de mesa</p>
          <div className="space-y-0">
            {hitos.map((h, i) => (
              <div key={h.year} className={`grid grid-cols-[80px_1fr] md:grid-cols-[140px_1fr] gap-6 md:gap-12 py-10 ${i > 0 ? "border-t border-white/5" : ""}`}>
                <div
                  className="text-3xl md:text-4xl font-light text-[#C9A45C] leading-none"
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                >
                  {h.year}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl mb-2 font-normal tracking-wide" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    {h.title}
                  </h3>
                  <p className="text-[#B7AD9C] font-light leading-relaxed text-[0.95rem] max-w-2xl">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRÓXIMAMENTE ── */}
      <section id="proximamente" className="relative border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.1),transparent_55%)]" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 py-32 md:py-44 text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-[#C9A45C] mb-8">Próximamente</p>
          <h2
            className="text-4xl md:text-6xl font-light leading-tight"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            El nuevo Bengal<br />está en construcción
          </h2>
          <div className="h-px w-16 bg-[#C9A45C]/60 mx-auto my-10" />
          <p className="text-[#B7AD9C] font-light max-w-md mx-auto leading-relaxed">
            Una nueva mesa, la misma historia. Los detalles, muy pronto.
          </p>
          <a
            href="mailto:hola@bengalrestaurante.com.ar?subject=Quiero%20saber%20del%20nuevo%20Bengal"
            className="inline-block mt-12 px-8 py-3.5 border border-[#C9A45C]/50 text-[#C9A45C] text-[11px] uppercase tracking-[0.3em] hover:bg-[#C9A45C] hover:text-[#0B0A09] transition-all duration-300"
          >
            Quiero ser el primero en saberlo
          </a>
        </div>
      </section>

      {/* ── HOY: LAS DOS UNIDADES ── */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A45C] mb-4 text-center">Mientras tanto</p>
          <h2
            className="text-3xl md:text-4xl font-light text-center mb-16"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Bengal, hoy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/empresas"
              className="group relative border border-white/10 hover:border-[#C9A45C]/60 transition-all duration-500 p-10 md:p-14 min-h-[320px] flex flex-col justify-between"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#C9A45C] mb-5">Gastronomía corporativa</p>
                <h3 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  Bengal Empresas
                </h3>
                <p className="text-[#B7AD9C] font-light leading-relaxed text-[0.95rem]">
                  Viandas gourmet, almuerzos ejecutivos, coffee breaks y eventos internos.
                  La cocina de Bengal, al servicio de las compañías del Parque Industrial Pilar.
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[#C9A45C] group-hover:gap-4 transition-all">
                Conocer Empresas <ArrowRight size={13} />
              </span>
            </Link>

            <Link
              href="/delivery"
              className="group relative border border-white/10 hover:border-[#C9A45C]/60 transition-all duration-500 p-10 md:p-14 min-h-[320px] flex flex-col justify-between"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#C9A45C] mb-5">A domicilio</p>
                <h3 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  Bengal Delivery
                </h3>
                <p className="text-[#B7AD9C] font-light leading-relaxed text-[0.95rem]">
                  Los clásicos de la casa — curries, cocina mediterránea y los platos de siempre —
                  llegan a tu mesa. Como en el salón, pero en tu casa.
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[#C9A45C] group-hover:gap-4 transition-all">
                Pedir a casa <ArrowRight size={13} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER de marca ── */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-lg tracking-[0.35em] font-light" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            BENGAL
          </span>
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
