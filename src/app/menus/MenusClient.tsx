"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, Leaf, Wheat, Heart, Flame, Dumbbell } from "lucide-react";
import type { MenusByCategory } from "./page";
import type { Menu } from "@/lib/supabase/types";
import DishModal from "@/components/DishModal";

// ─── Config de categorías ────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { label: string; subtitle: string; emoji: string }> = {
  entrada:  { label: "Entradas",           subtitle: "Para comenzar",         emoji: "🥗" },
  almuerzo: { label: "Platos Principales", subtitle: "El corazón del menú",   emoji: "🍽️" },
  postre:   { label: "Postres",            subtitle: "Para terminar bien",     emoji: "🍮" },
  bebida:   { label: "Bebidas",            subtitle: "Frías y calientes",      emoji: "🥤" },
  extra:    { label: "Extras",             subtitle: "Complementos a la carta",emoji: "➕" },
};

// ─── Filtros dietéticos ──────────────────────────────────────────────────────
const DIET_FILTERS = [
  { key: "all",       label: "Todo el menú",  icon: null },
  { key: "vegano",    label: "Vegano",         icon: <Leaf size={13} /> },
  { key: "celiaco",   label: "Sin TACC",       icon: <Wheat size={13} /> },
  { key: "diabetico", label: "Diabético",      icon: <Heart size={13} /> },
  { key: "keto",      label: "Keto",           icon: <Dumbbell size={13} /> },
  { key: "dieta",     label: "Baja cal.",      icon: <Flame size={13} /> },
] as const;

type DietKey = (typeof DIET_FILTERS)[number]["key"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function matchesDiet(tags: string[], diet: DietKey): boolean {
  if (diet === "all") return true;
  const t = tags.map((x) => x.toLowerCase());
  if (diet === "vegano")    return t.some((x) => x.includes("vegano") || x === "plant-based");
  if (diet === "celiaco")   return t.some((x) => x.includes("celíaco") || x.includes("celiaco") || x.includes("sin-tacc") || x.includes("sin-gluten") || x.includes("gluten"));
  if (diet === "diabetico") return t.some((x) => x.includes("diabético") || x.includes("diabetico") || x.includes("bajo-azucar"));
  if (diet === "keto")      return t.some((x) => x.includes("keto"));
  if (diet === "dieta")     return t.some((x) => x.includes("dieta") || x.includes("bajas-calorias") || x.includes("bajo-en-calorias") || x.includes("light") || x.includes("liviano"));
  return false;
}

function formatPrice(n: number) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

// ─── Item de carta ───────────────────────────────────────────────────────────
function CartaItem({ item, onOpen }: { item: Menu; onOpen: (m: Menu) => void }) {
  const hasImage = Boolean(item.image_url);

  return (
    <div className="flex gap-4 py-5 border-b border-cream-200 last:border-b-0 group">
      {/* Texto */}
      <div className="flex-1 min-w-0">
        {/* nombre + precio en línea */}
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-graphite-800 text-[15px] leading-snug flex-shrink-0 pr-1">
            {item.name}
          </span>
          <span className="flex-1 border-b border-dashed border-cream-300 mb-[3px]" />
          <span className="font-bold text-terracotta-600 text-[15px] flex-shrink-0 tabular-nums">
            {formatPrice(item.price)}
          </span>
        </div>

        {/* descripción */}
        {item.description && (
          <p className="text-warm-500 text-[13px] italic leading-relaxed mt-1">
            {item.description}
          </p>
        )}

        {/* tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-cream-200 text-warm-500 text-[11px] rounded-full font-medium leading-none"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* info nutricional inline */}
        {(item.calories || item.protein || item.carbs || item.fat) && (
          <div className="flex gap-3 mt-2 text-[11px] text-warm-400">
            {item.calories && <span>🔥 {item.calories} kcal</span>}
            {item.protein  && <span>💪 {item.protein}g prot</span>}
            {item.carbs    && <span>🌾 {item.carbs}g carb</span>}
            {item.fat      && <span>🧈 {item.fat}g grasas</span>}
          </div>
        )}
      </div>

      {/* Thumbnail — clic abre el modal con foto grande y sugerencias */}
      {hasImage && (
        <button
          onClick={() => onOpen(item)}
          title="Ver plato"
          className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-cream-200 shadow-sm cursor-pointer focus:outline-none"
        >
          <Image
            src={item.image_url!}
            alt={item.name}
            width={80}
            height={80}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </button>
      )}
    </div>
  );
}

// ─── Sección de categoría ────────────────────────────────────────────────────
function CategorySection({
  catKey,
  items,
  sectionRef,
  onOpen,
}: {
  catKey: string;
  items: Menu[];
  sectionRef: (el: HTMLElement | null) => void;
  onOpen: (m: Menu) => void;
}) {
  const meta = CATEGORY_META[catKey] ?? { label: catKey, subtitle: "", emoji: "📋" };

  return (
    <section ref={sectionRef} id={`cat-${catKey}`} className="scroll-mt-36">
      {/* Encabezado de sección */}
      <div className="flex items-center gap-4 mb-1 mt-10 first:mt-0">
        <div className="flex-1 h-px bg-cream-300" />
        <div className="text-center px-2">
          <div className="text-3xl mb-0.5">{meta.emoji}</div>
          <h2 className="text-xl font-bold text-graphite-800 tracking-wide uppercase leading-none">
            {meta.label}
          </h2>
          {meta.subtitle && (
            <p className="text-warm-400 text-xs mt-0.5">{meta.subtitle}</p>
          )}
        </div>
        <div className="flex-1 h-px bg-cream-300" />
      </div>

      {/* Contador */}
      <p className="text-center text-warm-400 text-xs mb-6">
        {items.length} {items.length === 1 ? "opción" : "opciones"}
      </p>

      {/* Lista de items */}
      <div className="divide-y divide-cream-200">
        {items.map((item) => (
          <CartaItem key={item.id} item={item} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function MenusClient({
  grouped,
  totalItems,
}: {
  grouped: MenusByCategory;
  totalItems: number;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeDiet, setActiveDiet] = useState<DietKey>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Menu | null>(null);
  const allItems = useMemo(() => Object.values(grouped).flat(), [grouped]);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const setSectionRef = useCallback(
    (catKey: string) => (el: HTMLElement | null) => {
      sectionRefs.current[catKey] = el;
    },
    []
  );

  const scrollToCategory = (catKey: string) => {
    setActiveCategory(catKey);
    if (catKey !== "all") {
      sectionRefs.current[catKey]?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const categories = Object.keys(grouped);

  // Aplicar filtros
  const filteredGrouped: MenusByCategory = {};
  for (const [cat, items] of Object.entries(grouped)) {
    const filtered = items.filter((item) => {
      const dietOk = matchesDiet(item.tags, activeDiet);
      const searchOk =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? "").toLowerCase().includes(search.toLowerCase());
      return dietOk && searchOk;
    });
    if (filtered.length > 0) filteredGrouped[cat] = filtered;
  }

  const filteredTotal = Object.values(filteredGrouped).reduce((s, arr) => s + arr.length, 0);

  return (
    <>
      {/* ── HEADER ── */}
      <section className="bg-graphite-800 pt-28 pb-14">
        <div className="container-xl text-center">
          <div className="divider-gold mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-cream-100 mb-3">Nuestra Carta</h1>
          <p className="text-warm-400 text-lg max-w-lg mx-auto">
            {totalItems} platos y bebidas. Cocina casera, ingredientes frescos, precios sin sorpresas.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <span className="px-3 py-1.5 bg-graphite-700 text-warm-300 text-sm rounded-full border border-graphite-600">
              Menú rotativo semanal
            </span>
            <span className="px-3 py-1.5 bg-terracotta-500/20 text-terracotta-300 text-sm rounded-full border border-terracotta-500/30">
              Corte: 10:00 hs
            </span>
            <span className="px-3 py-1.5 bg-graphite-700 text-warm-300 text-sm rounded-full border border-graphite-600">
              Set menú (E+P+P): $27.000
            </span>
          </div>
        </div>
      </section>

      {/* ── BARRA DE FILTROS STICKY ── */}
      <div className="sticky top-16 lg:top-20 z-40 bg-white border-b border-cream-200 shadow-sm">
        <div className="container-xl">
          {/* Row 1: categorías */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => scrollToCategory("all")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-graphite-800 text-cream-100 shadow"
                  : "bg-cream-100 text-graphite-600 hover:bg-cream-200 border border-cream-200"
              }`}
            >
              📋 Toda la carta
            </button>
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat] ?? { label: cat, emoji: "📋" };
              return (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-terracotta-500 text-white shadow"
                      : "bg-cream-100 text-graphite-600 hover:bg-cream-200 border border-cream-200"
                  }`}
                >
                  {meta.emoji} {meta.label}
                </button>
              );
            })}
          </div>

          {/* Row 2: filtros dietéticos + buscador */}
          <div className="flex items-center gap-3 pb-3 overflow-x-auto scrollbar-hide">
            {/* Buscador */}
            <div className="relative flex-shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
              <input
                type="text"
                placeholder="Buscar plato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm bg-cream-100 border border-cream-200 rounded-full text-graphite-700 placeholder-warm-400 focus:outline-none focus:border-terracotta-400 w-44"
              />
            </div>

            <div className="w-px h-5 bg-cream-200 flex-shrink-0" />

            {/* Filtros dieta */}
            {DIET_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveDiet(f.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeDiet === f.key
                    ? "bg-graphite-800 text-cream-100 shadow"
                    : "bg-cream-100 text-warm-500 hover:bg-cream-200 border border-cream-200"
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <section className="section-py bg-cream-50">
        <div className="container-xl max-w-3xl">
          {/* Contador de resultados */}
          <p className="text-warm-400 text-sm mb-8 text-center">
            {filteredTotal === totalItems
              ? `${totalItems} platos en carta`
              : `${filteredTotal} de ${totalItems} platos`}
          </p>

          {Object.keys(filteredGrouped).length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-warm-400 text-lg mb-2">No encontramos platos con esos filtros.</p>
              <button
                onClick={() => { setActiveDiet("all"); setSearch(""); }}
                className="text-terracotta-600 font-semibold hover:underline text-sm"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(filteredGrouped).map(([cat, items]) => (
                <CategorySection
                  key={cat}
                  catKey={cat}
                  items={items}
                  sectionRef={setSectionRef(cat)}
                  onOpen={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="py-14 bg-cream-200 border-t border-cream-300">
        <div className="container-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              {
                title: "¿Ya tenés cuenta?",
                desc: "Ingresá al portal y hacé tu pedido del día en menos de 2 minutos.",
                cta: "Hacer pedido",
                href: "/pedidos",
              },
              {
                title: "¿Empresa nueva?",
                desc: "Solicitá una degustación gratuita para tu equipo y conocé la propuesta.",
                cta: "Pedir degustación",
                href: "/degustaciones",
              },
              {
                title: "¿Tenés dudas?",
                desc: "Te enviamos la propuesta personalizada o hablamos por WhatsApp.",
                cta: "Contactar",
                href: "/contacto",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 shadow-card border border-cream-200 flex flex-col"
              >
                <h3 className="font-bold text-graphite-800 mb-2">{item.title}</h3>
                <p className="text-warm-500 text-sm mb-4 flex-1">{item.desc}</p>
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-center gap-1 text-terracotta-600 font-semibold text-sm hover:text-terracotta-700 transition-colors"
                >
                  {item.cta} <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modal de plato ── */}
      {selected && (
        <DishModal
          item={selected}
          all={allItems}
          theme="light"
          money={formatPrice}
          onClose={() => setSelected(null)}
          onSwap={(d) => setSelected(d as Menu)}
          action={
            <Link
              href="/pedidos"
              className="block w-full text-center py-3.5 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors"
            >
              Pedirlo en el portal
            </Link>
          }
        />
      )}
    </>
  );
}
