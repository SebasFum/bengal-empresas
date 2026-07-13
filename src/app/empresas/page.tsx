import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Star, ChevronRight, Flame, TrendingUp, CalendarCheck } from "lucide-react";
import { services, steps, testimonials, companies } from "@/lib/data";
import CountdownBadge from "@/components/CountdownBadge";
import SmartBanner from "@/components/SmartBanner";
import { sql } from "@/lib/db";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type LiveMenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  calories: number | null;
  tags: string[];
  image_url: string | null;
  stock: number | null;
  orders_count: number | null;
};

type TimeContext = "early" | "open" | "closed" | "afternoon" | "evening";

function getTimeContext(): TimeContext {
  // Use BA timezone (UTC-3)
  const h = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getHours();
  if (h < 8) return "early";
  if (h < 10) return "open";
  if (h < 14) return "closed";
  if (h < 18) return "afternoon";
  return "evening";
}

// ── Fetch server-side via Neon ────────────────────────────────────────────────
async function getTodayMenus(): Promise<{ items: LiveMenuItem[]; isDaily: boolean }> {
  const today = new Date().toISOString().split("T")[0];

  try {
    const rows = await sql`
      SELECT dm.stock, dm.orders_count,
             m.id, m.name, m.description, m.category, m.price, m.calories, m.tags, m.image_url
      FROM daily_menus dm
      JOIN menus m ON m.id = dm.menu_id
      WHERE dm.date = ${today} AND dm.stock > 0
      ORDER BY dm.orders_count DESC
      LIMIT 3
    `;
    if (rows.length > 0) {
      return {
        isDaily: true,
        items: rows.map((r) => ({
          id: r.id as string, name: r.name as string, description: r.description as string | null,
          category: r.category as string, price: r.price as number, calories: r.calories as number | null,
          tags: r.tags as string[], image_url: r.image_url as string | null,
          stock: r.stock as number, orders_count: r.orders_count as number,
        })),
      };
    }
  } catch (e) { console.error("[getTodayMenus] daily:", e); }

  try {
    const rows = await sql`
      SELECT id, name, description, category, price, calories, tags, image_url
      FROM menus WHERE active = true AND category = 'almuerzo'
      ORDER BY name LIMIT 3
    `;
    return {
      isDaily: false,
      items: rows.map((r) => ({
        id: r.id as string, name: r.name as string, description: r.description as string | null,
        category: r.category as string, price: r.price as number, calories: r.calories as number | null,
        tags: r.tags as string[], image_url: r.image_url as string | null,
        stock: null, orders_count: null,
      })),
    };
  } catch (e) { console.error("[getTodayMenus] fallback:", e); }

  return { items: [], isDaily: false };
}

export const metadata = {
  title: "Bengal Empresas — Gastronomía Premium Corporativa",
  description: "Viandas gourmet y eventos corporativos para equipos que exigen calidad. Pedidos simples, servicio impecable.",
};

// ── Página ────────────────────────────────────────────────────────────────────
export default async function EmpresasHomePage() {
  const today = new Date();
  const todayLabel = today.toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const timeCtx = getTimeContext();
  const { items: liveMenus, isDaily } = await getTodayMenus();
  const fallback = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80";

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=85"
            alt="Gastronomía gourmet corporativa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite-900/85 via-graphite-900/55 to-transparent" />
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
                Ver carta completa
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

      {/* ── LOGOS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-cream-200 border-y border-cream-300">
        <div className="container-xl py-6">
          <div className="flex items-center gap-6 overflow-hidden">
            <span className="text-xs font-semibold text-warm-500 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
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

      {/* ── SMART BANNER (solo para usuarios logueados) ──────────────────── */}
      <SmartBanner />

      {/* ── MENÚ DEL DÍA (datos en vivo) ─────────────────────────────────── */}
      <section className="section-py bg-graphite-800">
        <div className="container-xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
            <div>
              {/* Línea naranja + indicador live */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 bg-terracotta-400" />
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">En vivo</span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-cream-100 capitalize">
                {isDaily ? "Menú de hoy" : "De nuestra carta"}
              </h2>
              <p className="text-warm-400 mt-2 capitalize text-base">{todayLabel}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Countdown badge (client component) */}
              <CountdownBadge />

              <Link
                href="/menus"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-terracotta-400 text-terracotta-400 font-semibold rounded-xl hover:bg-terracotta-500 hover:text-white transition-all whitespace-nowrap text-sm"
              >
                Ver carta completa <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Grilla de platos */}
          {liveMenus.length === 0 ? (
            <div className="text-center py-16 bg-graphite-700 rounded-2xl border border-graphite-600">
              <p className="text-3xl mb-3">🍽️</p>
              <p className="text-warm-400 text-base">El menú del día se publica cada mañana.</p>
              <Link href="/menus" className="mt-4 inline-flex items-center gap-1.5 text-terracotta-400 font-semibold text-sm hover:text-terracotta-300">
                Ver la carta completa <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {liveMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="group bg-graphite-700 rounded-2xl overflow-hidden border border-graphite-600 hover:border-terracotta-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md"
                >
                  {/* Imagen */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={menu.image_url ?? fallback}
                      alt={menu.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/60 to-transparent" />

                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      {isDaily && (
                        <span className="px-2.5 py-1 bg-green-500/90 text-white text-[10px] font-bold rounded-full">
                          HOY
                        </span>
                      )}
                      {isDaily && (menu.orders_count ?? 0) >= 5 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 text-white text-[10px] font-bold rounded-full">
                          <TrendingUp size={9} /> {menu.orders_count} pedidos
                        </span>
                      )}
                      {(menu.tags ?? []).slice(0, 1).map((tag) => (
                        <span key={tag} className="px-2.5 py-1 bg-terracotta-500/80 text-white text-[10px] font-medium rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stock bajo o trending sin daily */}
                    {isDaily && menu.stock !== null && menu.stock <= 10 ? (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 bg-red-500/90 text-white text-[10px] font-bold rounded-full animate-pulse">
                          ⚡ Últimos {menu.stock}
                        </span>
                      </div>
                    ) : isDaily && (menu.orders_count ?? 0) >= 10 ? (
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 text-white text-[10px] font-bold rounded-full">
                          🔥 El más pedido hoy
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-cream-100 mb-1.5 leading-snug">
                      {menu.name}
                    </h3>
                    {menu.description && (
                      <p className="text-warm-400 text-sm leading-relaxed mb-3 line-clamp-2">
                        {menu.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-terracotta-400 font-bold text-lg">
                          $ {menu.price.toLocaleString("es-AR")}
                        </span>
                        {menu.calories && (
                          <span className="flex items-center gap-0.5 text-warm-500 text-xs mt-0.5">
                            <Flame size={10} className="text-terracotta-600" /> {menu.calories} kcal
                          </span>
                        )}
                      </div>
                      <Link
                        href="/pedidos"
                        className="px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors"
                      >
                        Pedir
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA invitación a registrarse */}
          <div className="mt-10 bg-graphite-700/60 border border-graphite-600 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-cream-200 font-semibold">¿Ya tenés cuenta?</p>
              <p className="text-warm-400 text-sm mt-0.5">Ingresá al portal y pedí en menos de 3 clics.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="px-5 py-2.5 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors whitespace-nowrap">
                Hacer mi pedido
              </Link>
              <Link href="/menus" className="px-5 py-2.5 border border-graphite-500 text-warm-300 text-sm font-medium rounded-xl hover:border-terracotta-500 hover:text-terracotta-400 transition-colors whitespace-nowrap">
                Ver carta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIME-AWARE CTA ───────────────────────────────────────────────── */}
      {timeCtx === "closed" && (
        <section className="bg-terracotta-500/10 border-y border-terracotta-500/20">
          <div className="container-xl py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-terracotta-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarCheck size={16} className="text-terracotta-400" />
              </div>
              <div>
                <p className="text-graphite-700 font-semibold text-sm">Los pedidos de hoy ya cerraron (10:00 hs)</p>
                <p className="text-warm-500 text-xs mt-0.5">Mañana abrimos a las 8:00 · También podés consultar por eventos corporativos</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/eventos" className="px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors whitespace-nowrap">
                Ver eventos
              </Link>
              <Link href="/contacto" className="px-4 py-2 border border-terracotta-300 text-terracotta-600 text-sm font-medium rounded-xl hover:bg-terracotta-50 transition-colors whitespace-nowrap">
                Contactar
              </Link>
            </div>
          </div>
        </section>
      )}

      {timeCtx === "afternoon" && (
        <section className="bg-graphite-800 border-y border-graphite-700">
          <div className="container-xl py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-terracotta-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarCheck size={16} className="text-terracotta-400" />
              </div>
              <div>
                <p className="text-cream-200 font-semibold text-sm">¿Pensando en un evento o coffee break?</p>
                <p className="text-warm-400 text-xs mt-0.5">Cotizamos en 24hs — catering, desayunos y almuerzos ejecutivos para tu empresa</p>
              </div>
            </div>
            <Link href="/eventos" className="flex-shrink-0 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors whitespace-nowrap">
              Cotizar evento
            </Link>
          </div>
        </section>
      )}

      {timeCtx === "evening" && (
        <section className="bg-graphite-800 border-y border-graphite-700">
          <div className="container-xl py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-terracotta-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarCheck size={16} className="text-terracotta-400" />
              </div>
              <div>
                <p className="text-cream-200 font-semibold text-sm">Mañana abrimos los pedidos a las 8:00 hs</p>
                <p className="text-warm-400 text-xs mt-0.5">Registrate ahora y pedís tu vianda en menos de 3 clics</p>
              </div>
            </div>
            <Link href="/login" className="flex-shrink-0 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors whitespace-nowrap">
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      )}

      {/* ── SERVICIOS ────────────────────────────────────────────────────── */}
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

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────── */}
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

      {/* ── IMAGEN GRANDE — EVENTOS ───────────────────────────────────────── */}
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

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
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

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
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
