"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart, Heart, CheckCircle, Clock, Flame, X,
  RefreshCw, AlertCircle, Tag, Leaf, Wheat, Plus,
} from "lucide-react";
import { placeOrder } from "@/app/actions/orders";
import type { MenuItem } from "./page";
import type { Segment } from "@/lib/supabase/types";

const AVAILABLE_EXTRAS = [
  "Ensalada extra", "Pan artesanal", "Agua mineral", "Jugo natural", "Postre del día",
];

const SEGMENT_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  empresa: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  hogar:   { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  eventos: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

const DIET_TAG_ICONS: Record<string, React.ReactNode> = {
  vegano:    <Leaf size={10} />,
  "sin-tacc": <Wheat size={10} />,
  celíaco:   <Wheat size={10} />,
  celiaco:   <Wheat size={10} />,
};

type Promo = {
  id: string; name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderTotal: number | null;
};

type Props = {
  menuItems: MenuItem[];
  categories: { id: string; label: string }[];
  today: string;
  todayLabel: string;
  userInitial: string;
  userSegment: Segment;
  segmentLabel: string;
  promotions: Promo[];
};

function fmt(n: number) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

// ── Card de plato ─────────────────────────────────────────────────────────────
function MenuCard({
  menu, selected, isFav, priceInfo, onSelect, onFav,
}: {
  menu: MenuItem;
  selected: boolean;
  isFav: boolean;
  priceInfo: { price: number; discount: number; promo: Promo | null };
  onSelect: () => void;
  onFav: (e: React.MouseEvent) => void;
}) {
  const { price, discount } = priceInfo;
  const fallback = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80";
  const dietTags = (menu.tags ?? []).filter((t) => DIET_TAG_ICONS[t.toLowerCase()]);

  return (
    /* Mobile: fila horizontal. md+: tarjeta vertical */
    <div
      onClick={onSelect}
      className={`
        flex md:flex-col bg-white rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-200 border-2
        ${selected
          ? "border-terracotta-500 shadow-warm-md scale-[1.01]"
          : "border-cream-200 shadow-card hover:border-terracotta-200 hover:shadow-warm"}
      `}
    >
      {/* Imagen */}
      <div className="relative w-28 h-28 md:w-full md:h-44 flex-shrink-0 overflow-hidden">
        <Image
          src={menu.image_url ?? fallback}
          alt={menu.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 112px, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Badge promoción */}
        {priceInfo.promo && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-terracotta-500 text-white text-[10px] font-bold rounded-full">
            {priceInfo.promo.discountType === "percentage"
              ? `${priceInfo.promo.discountValue}% OFF`
              : `-${fmt(priceInfo.promo.discountValue)}`}
          </span>
        )}

        {/* Check overlay cuando está seleccionado */}
        {selected && (
          <div className="absolute inset-0 bg-terracotta-500/15 flex items-end justify-end p-2">
            <div className="w-7 h-7 bg-terracotta-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle size={15} className="text-white" />
            </div>
          </div>
        )}

        {/* Tags dieta (sólo en mobile, arriba derecha) */}
        {dietTags.length > 0 && (
          <div className="absolute bottom-2 left-2 md:hidden flex gap-1">
            {dietTags.slice(0, 2).map((t) => (
              <span key={t} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-medium rounded-full">
                {DIET_TAG_ICONS[t.toLowerCase()]} {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 p-3 md:p-4 flex flex-col min-w-0">
        <div className="flex-1">
          <h3 className="font-bold text-graphite-800 text-[13px] md:text-sm leading-snug line-clamp-2 mb-0.5">
            {menu.name}
          </h3>
          {menu.description && (
            <p className="text-warm-400 text-[11px] md:text-xs leading-relaxed line-clamp-1 md:line-clamp-2">
              {menu.description}
            </p>
          )}

          {/* Tags — sólo desktop */}
          {dietTags.length > 0 && (
            <div className="hidden md:flex flex-wrap gap-1 mt-2">
              {dietTags.slice(0, 3).map((t) => (
                <span key={t} className="flex items-center gap-0.5 px-2 py-0.5 bg-cream-100 text-warm-500 text-[10px] font-medium rounded-full border border-cream-200">
                  {DIET_TAG_ICONS[t.toLowerCase()]} {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer de la card */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <div>
            {discount > 0 && (
              <p className="text-warm-300 text-[10px] line-through leading-none">
                {fmt(menu.segmentPrice)}
              </p>
            )}
            <span className="text-terracotta-600 font-bold text-sm leading-none">{fmt(price)}</span>
            {menu.calories ? (
              <span className="flex items-center gap-0.5 text-[10px] text-warm-400 mt-0.5">
                <Flame size={9} className="text-terracotta-300" /> {menu.calories} kcal
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Favorito */}
            <button
              onClick={onFav}
              className="w-7 h-7 rounded-full bg-cream-100 flex items-center justify-center hover:bg-cream-200 transition-colors flex-shrink-0"
            >
              <Heart size={13} className={isFav ? "text-red-500 fill-red-500" : "text-warm-400"} />
            </button>

            {/* Botón pedir */}
            <button
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0
                ${selected
                  ? "bg-terracotta-500 text-white"
                  : "bg-terracotta-50 text-terracotta-600 hover:bg-terracotta-500 hover:text-white border border-terracotta-200"}
              `}
            >
              {selected ? <CheckCircle size={12} /> : <Plus size={12} />}
              {selected ? "Listo" : "Pedir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PedidosClient({
  menuItems, categories, today, todayLabel,
  userInitial, userSegment, segmentLabel, promotions,
}: Props) {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const segColors = SEGMENT_COLOR[userSegment] ?? { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };

  const getEffectivePrice = (menu: MenuItem) => {
    const base = menu.segmentPrice;
    const applicablePromo = promotions.find(
      (p) => p.minOrderTotal === null || base >= p.minOrderTotal
    );
    if (!applicablePromo) return { price: base, discount: 0, promo: null };
    const discount = applicablePromo.discountType === "percentage"
      ? base * (applicablePromo.discountValue / 100)
      : applicablePromo.discountValue;
    return { price: Math.max(0, base - discount), discount, promo: applicablePromo };
  };

  const toggleFav = (id: string) =>
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const toggleExtra = (e: string) =>
    setExtras((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  const handleSelect = (id: string) => {
    setSelected(id);
    setError(null);
    setSheetVisible(true);
  };

  const handleClose = () => {
    setSheetVisible(false);
    setTimeout(() => setSelected(null), 300);
    setExtras([]);
    setNota("");
    setError(null);
  };

  const handleConfirm = () => {
    const selectedMenu = menuItems.find((m) => m.id === selected);
    if (!selectedMenu) return;
    setError(null);
    const { price } = getEffectivePrice(selectedMenu);
    startTransition(async () => {
      const result = await placeOrder({
        menu_id: selectedMenu.id,
        daily_menu_id: selectedMenu.dailyMenuId ?? undefined,
        date: today,
        extras,
        notes: nota,
        total: price,
        segment: userSegment,
      });
      if (result.success) {
        setConfirmedName(selectedMenu.name);
        setConfirmed(true);
        handleClose();
      } else {
        setError(result.error ?? "Error al confirmar el pedido");
      }
    });
  };

  // Cerrar con Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  const filtered = activeCategory === "todos"
    ? menuItems
    : menuItems.filter((m) => m.category === activeCategory || (m.tags ?? []).includes(activeCategory));

  const selectedMenu = menuItems.find((m) => m.id === selected);
  const fallback = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80";

  return (
    <div className="min-h-screen bg-cream-50">

      {/* ── HEADER ── */}
      <div className="bg-graphite-800 pt-16 pb-0 shadow-lg">
        <div className="container-xl px-4">
          <div className="flex items-start justify-between py-5 gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-cream-100 leading-tight">
                Hacé tu pedido
              </h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-warm-400 text-sm capitalize">{todayLabel}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${segColors.bg} ${segColors.text} ${segColors.border}`}>
                  {segmentLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/historial"
                className="flex items-center gap-1 text-xs text-warm-400 hover:text-cream-300 transition-colors">
                <RefreshCw size={13} /> Historial
              </Link>
              <Link href="/mi-cuenta"
                className="w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
                {userInitial}
              </Link>
            </div>
          </div>

          {/* Corte + promos */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-300 bg-terracotta-900/40 border border-terracotta-700/40 px-3 py-1.5 rounded-full flex-shrink-0">
              <Clock size={11} /> Corte: 10:00 hs
            </span>
            {promotions.map((p) => (
              <div key={p.id}
                className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-300">
                <Tag size={11} />
                {p.name} — {p.discountType === "percentage" ? `${p.discountValue}% OFF` : `${fmt(p.discountValue)} OFF`}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-cream-200 shadow-sm">
        <div className="container-xl px-4">
          <div className="flex gap-2 overflow-x-auto py-2.5 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "bg-terracotta-500 text-white shadow"
                    : "bg-cream-100 text-graphite-600 hover:bg-cream-200 border border-cream-200"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONFIRMACIÓN ── */}
      {confirmed && (
        <div className="container-xl px-4 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-green-800 text-sm">¡Pedido confirmado!</p>
              <p className="text-green-600 text-xs mt-0.5 truncate">
                <strong>{confirmedName}</strong> — te avisamos cuando esté listo.
              </p>
            </div>
            <button onClick={() => setConfirmed(false)} className="text-green-400 hover:text-green-600 flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── GRILLA / LISTA ── */}
      <div className="container-xl px-4 py-4 pb-24">
        {menuItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-warm-400 text-base">No hay menú disponible para hoy.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-warm-400 text-sm">Sin platos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5">
            {filtered.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                selected={selected === menu.id}
                isFav={favorites.includes(menu.id)}
                priceInfo={getEffectivePrice(menu)}
                onSelect={() => handleSelect(menu.id)}
                onFav={(e) => { e.stopPropagation(); toggleFav(menu.id); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM SHEET (modal) ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className={`absolute inset-0 bg-graphite-900/60 transition-opacity duration-300 ${sheetVisible ? "opacity-100" : "opacity-0"}`} />

          {/* Sheet */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`
              relative bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden
              transition-transform duration-300 ease-out
              ${sheetVisible ? "translate-y-0" : "translate-y-full md:translate-y-4 opacity-0"}
            `}
          >
            {/* Handle bar (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 bg-cream-300 rounded-full" />
            </div>

            {selectedMenu && (
              <>
                {/* Imagen del plato */}
                <div className="relative h-48">
                  <Image
                    src={selectedMenu.image_url ?? fallback}
                    alt={selectedMenu.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/85 to-graphite-900/10" />
                  <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-4 left-4 right-16">
                    <h2 className="text-lg font-bold text-white leading-snug">{selectedMenu.name}</h2>
                    <div className="flex items-baseline gap-2 mt-1">
                      {(() => {
                        const { price, discount } = getEffectivePrice(selectedMenu);
                        return (
                          <>
                            {discount > 0 && (
                              <span className="text-cream-400 text-sm line-through">
                                {fmt(selectedMenu.segmentPrice)}
                              </span>
                            )}
                            <span className="text-terracotta-300 font-bold text-lg">{fmt(price)}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="p-5 max-h-[60vh] overflow-y-auto">
                  {/* Descripción */}
                  {selectedMenu.description && (
                    <p className="text-warm-500 text-sm leading-relaxed mb-4">{selectedMenu.description}</p>
                  )}

                  {/* Info nutricional */}
                  {(selectedMenu.calories || selectedMenu.protein || selectedMenu.carbs || selectedMenu.fat) && (
                    <div className="bg-cream-50 border border-cream-200 rounded-xl p-4 mb-4">
                      <p className="text-[10px] font-semibold text-graphite-500 uppercase tracking-wider mb-3">
                        Información nutricional
                      </p>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[
                          { label: "Kcal",   value: selectedMenu.calories, unit: "",   color: "text-terracotta-600" },
                          { label: "Prot.",  value: selectedMenu.protein,  unit: "g", color: "text-blue-600" },
                          { label: "Carbs",  value: selectedMenu.carbs,    unit: "g", color: "text-amber-600" },
                          { label: "Grasas", value: selectedMenu.fat,      unit: "g", color: "text-green-600" },
                        ].map((n) => n.value != null && (
                          <div key={n.label} className="text-center bg-white rounded-lg py-2 px-1 border border-cream-200">
                            <p className={`font-bold text-sm ${n.color}`}>
                              {n.value}<span className="text-[10px] font-normal text-warm-400">{n.unit}</span>
                            </p>
                            <p className="text-[10px] text-warm-400">{n.label}</p>
                          </div>
                        ))}
                      </div>
                      {/* Barra de macros */}
                      {selectedMenu.protein && selectedMenu.carbs && selectedMenu.fat && (() => {
                        const total = selectedMenu.protein * 4 + selectedMenu.carbs * 4 + selectedMenu.fat * 9;
                        const pP = total > 0 ? Math.round(selectedMenu.protein * 4 / total * 100) : 0;
                        const pC = total > 0 ? Math.round(selectedMenu.carbs * 4 / total * 100) : 0;
                        const pF = 100 - pP - pC;
                        return (
                          <div>
                            <div className="flex rounded-full overflow-hidden h-1.5 mb-1.5">
                              <div className="bg-blue-400"  style={{ width: `${pP}%` }} />
                              <div className="bg-amber-400" style={{ width: `${pC}%` }} />
                              <div className="bg-green-400" style={{ width: `${pF}%` }} />
                            </div>
                            <div className="flex gap-3 justify-center">
                              {[["bg-blue-400","Prot.",pP],["bg-amber-400","Carbs",pC],["bg-green-400","Grasas",pF]].map(([c,l,v]) => (
                                <span key={String(l)} className="flex items-center gap-1 text-[10px] text-warm-400">
                                  <span className={`w-1.5 h-1.5 rounded-full ${c}`} />{l} {v}%
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Extras */}
                  <p className="text-[11px] font-semibold text-graphite-600 uppercase tracking-wider mb-2">
                    Extras opcionales
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {AVAILABLE_EXTRAS.map((extra) => (
                      <button key={extra} onClick={() => toggleExtra(extra)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          extras.includes(extra)
                            ? "bg-terracotta-500 text-white"
                            : "bg-cream-100 text-graphite-600 hover:bg-cream-200 border border-cream-200"
                        }`}>
                        {extras.includes(extra) && "✓ "}{extra}
                      </button>
                    ))}
                  </div>

                  {/* Nota */}
                  <p className="text-[11px] font-semibold text-graphite-600 uppercase tracking-wider mb-2">
                    Comentario o restricción
                  </p>
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    rows={2}
                    placeholder="Sin cebolla, sin picante, etc."
                    className="input-base resize-none text-sm mb-4"
                  />

                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-terracotta-500 text-white font-bold text-base rounded-2xl hover:bg-terracotta-600 disabled:opacity-60 transition-all shadow-warm active:scale-[0.98]"
                  >
                    {isPending
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Confirmando...</>
                      : <><ShoppingCart size={18} /> Confirmar pedido</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
