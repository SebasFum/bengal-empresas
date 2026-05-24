import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Star, ChevronRight } from "lucide-react";
import { services, steps, testimonials, companies, menus } from "@/lib/data";

export default function HomePage() {
  const featuredMenus = menus.filter((m) => m.featured).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=85"
            alt="Gastronomía gourmet corporativa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite-900/80 via-graphite-900/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container-xl pt-24 pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-cream-200 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-terracotta-400 rounded-full animate-pulse" />
              Gastronomía premium para empresas
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Comida que{" "}
              <span className="text-terracotta-400 italic">eleva</span>
              {" "}el nivel de tu empresa
            </h1>

            <p className="text-lg md:text-xl text-cream-300 leading-relaxed mb-10 max-w-xl">
              Viandas gourmet y eventos corporativos con presentación impecable.
              Portal de pedidos en 3 clics. Entrega puntual, sin sorpresas.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/menus"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all hover:-translate-y-0.5 shadow-lg"
              >
                Ver menús de hoy
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/degustaciones"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
              >
                Degustación gratis
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-cream-300 text-sm">
              {["Mínimo 5 personas", "Entrega puntual", "Sin contrato de permanencia"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-terracotta-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-8 right-8 hidden lg:flex gap-4">
          {[
            { value: "+80", label: "empresas activas" },
            { value: "500+", label: "almuerzos / día" },
            { value: "4.9★", label: "satisfacción" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-cream-300 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOGOS STRIP */}
      <section className="bg-cream-200 border-y border-cream-300">
        <div className="container-xl py-6">
          <div className="flex items-center gap-6 overflow-hidden">
            <span className="text-xs font-semibold text-warm-500 uppercase tracking-wider whitespace-nowrap">
              Confían en Bengal
            </span>
            <div className="flex flex-1 gap-8 overflow-hidden">
              {companies.map((c) => (
                <span key={c} className="text-warm-400 font-semibold text-sm whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="text-center mb-14">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold text-graphite-800 mb-4">
              Todo lo que tu empresa necesita
            </h2>
            <p className="text-warm-500 text-lg max-w-xl mx-auto">
              Desde el almuerzo diario hasta el evento más especial.
              Un solo proveedor, calidad constante.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="group bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-cream-200"
              >
                <div className="text-4xl mb-5">{service.icon}</div>
                <h3 className="text-xl font-bold text-graphite-800 mb-3">{service.title}</h3>
                <p className="text-warm-500 text-sm leading-relaxed mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-graphite-600">
                      <CheckCircle size={14} className="text-terracotta-500 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1 text-terracotta-600 text-sm font-semibold group-hover:gap-2 transition-all">
                  Ver más <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MENÚ DESTACADO */}
      <section className="section-py bg-graphite-800">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="divider-gold mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold text-cream-100">
                Menú de esta semana
              </h2>
              <p className="text-warm-400 mt-3 text-lg">
                Variedad, sabor y presentación que hablan solos.
              </p>
            </div>
            <Link
              href="/menus"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-terracotta-400 text-terracotta-400 font-semibold rounded-xl hover:bg-terracotta-500 hover:text-white transition-all whitespace-nowrap"
            >
              Ver menú completo <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMenus.map((menu) => (
              <div key={menu.id} className="group bg-graphite-700 rounded-2xl overflow-hidden border border-graphite-600 hover:border-terracotta-500/50 transition-all">
                <div className="relative h-52 img-zoom">
                  <Image
                    src={menu.image}
                    alt={menu.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    {menu.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-terracotta-500/90 text-white text-xs font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-cream-100 mb-2">{menu.name}</h3>
                  <p className="text-warm-400 text-sm leading-relaxed mb-4 line-clamp-2">{menu.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-terracotta-400 font-bold text-lg">
                      ${menu.price.toLocaleString()}
                    </span>
                    <Link
                      href="/pedidos"
                      className="px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-lg hover:bg-terracotta-600 transition-colors"
                    >
                      Pedir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="text-center mb-14">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold text-graphite-800 mb-4">
              Así de simple
            </h2>
            <p className="text-warm-500 text-lg max-w-lg mx-auto">
              Cuatro pasos para que tu equipo disfrute de gastronomía premium cada día.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white rounded-2xl p-6 shadow-card border border-cream-200">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 bg-terracotta-50 text-terracotta-500 font-bold text-lg rounded-xl mb-5"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {step.number}
                </div>
                <h3 className="font-bold text-graphite-800 mb-2 text-lg">{step.title}</h3>
                <p className="text-warm-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/como-funciona"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-terracotta-500 text-terracotta-600 font-semibold rounded-xl hover:bg-terracotta-500 hover:text-white transition-all"
            >
              Conocer más detalles <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* IMAGEN GRANDE — EVENTOS */}
      <section className="relative h-96 md:h-[520px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1600&q=85"
          alt="Eventos corporativos Bengal"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite-900/70 to-graphite-900/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-xl">
            <div className="max-w-lg">
              <p className="text-terracotta-300 font-medium mb-3 uppercase tracking-wider text-sm">Eventos corporativos</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
                Cada detalle, pensado para tu empresa
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Desayunos, coffee breaks, almuerzos ejecutivos y celebraciones. Presentación impecable, servicio profesional.
              </p>
              <Link
                href="/eventos"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all"
              >
                Ver servicios de eventos <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="text-center mb-14">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold text-graphite-800 mb-4">
              Lo que dicen las empresas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl p-8 shadow-card border border-cream-200 card-lift">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-gold-400 fill-gold-400" />
                  ))}
                </div>
                <p className="text-graphite-700 leading-relaxed mb-6 text-[0.95rem] italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-cream-200">
                  <div className="w-10 h-10 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-graphite-800 text-sm">{t.name}</p>
                    <p className="text-warm-400 text-xs">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section-py bg-terracotta-500">
        <div className="container-xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para cambiar el nivel?
          </h2>
          <p className="text-terracotta-100 text-xl mb-10 max-w-xl mx-auto">
            Pedí una degustación gratuita y en 48hs tu equipo ya está disfrutando de Bengal.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/degustaciones"
              className="px-8 py-4 bg-white text-terracotta-600 font-bold rounded-xl hover:bg-cream-100 transition-colors shadow-lg text-lg"
            >
              Solicitar degustación gratis
            </Link>
            <Link
              href="/contacto"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-lg"
            >
              Hablar con un asesor
            </Link>
          </div>
          <p className="text-terracotta-200 text-sm mt-8">
            Sin permanencia mínima · Sin costo de alta · Respuesta en 24hs
          </p>
        </div>
      </section>
    </>
  );
}
