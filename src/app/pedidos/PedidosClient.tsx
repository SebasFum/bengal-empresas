"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, CheckCircle, Clock, Flame, X, RefreshCw, AlertCircle, Tag } from "lucide-react";
import { placeOrder } from "@/app/actions/orders";
import type { MenuItem } from "./page";
import type { Segment } from "@/lib/supabase/types";

const AVAILABLE_EXTRAS = ["Ensalada extra", "Pan artesanal", "Agua mineral", "Jugo natural", "Postre del día"];

const SEGMENT_COLOR: Record<string, string> = {
  empresa: "bg-blue-50 text-blue-700 border-blue-200",
  hogar:   "bg-green-50 text-green-700 border-green-200",
  eventos: "bg-purple-50 text-purple-700 border-purple-200",
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
  const [isPending, startTransition] = useTransition();

  const filtered = activeCategory === "todos"
    ? menuItems
    : menuItems.filter((m) => m.category === activeCategory || m.tags.includes(activeCategory));

  const selectedMenu = menuItems.find((m) => m.id === selected);

  // Calcular precio con promoción aplicable
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

  const handleConfirm = () => {
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
        setSelected(null);
        setExtras([]);
        setNota("");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <div className="bg-white border-b border-cream-200 pt-16 pb-0">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-graphite-800">Hacé tu pedido</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${SEGMENT_COLOR[userSegment] ?? "bg-gray-100 text-gray-600"}`}>
                  {segmentLabel}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-warm-400 text-sm capitalize">{todayLabel}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-terracotta-600 bg-terracotta-50 px-3 py-1.5 rounded-full">
                  <Clock size={11} /> Corte: 10:00 hs
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/historial" className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-terracotta-600 transition-colors">
                <RefreshCw size={14} /> Mi historial
              </Link>
              <Link href="/mi-cuenta" className="w-8 h-8 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 text-sm font-bold">
                {userInitial}
              </Link>
            </div>
          </div>

          {/* Promociones activas */}
          {promotions.length > 0 && (
            <div className="flex gap-2 pb-3 overflow-x-auto">
              {promotions.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 bg-terracotta-50 border border-terracotta-200 rounded-full text-xs font-semibold text-terracotta-700">
                  <Tag size={11} />
                  {p.name} — {p.discountType === "percentage" ? `${p.discountValue}% OFF` : `$${p.discountValue} OFF`}
                </div>
              ))}
            </div>
          )}

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat.id ? "bg-terracotta-500 text-white" : "bg-cream-200 text-graphite-600 hover:bg-cream-300"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmación */}
      {confirmed && (
        <div className="container-xl pt-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
            <CheckCircle size={22} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">¡Pedido confirmado!</p>
              <p className="text-green-600 text-sm"><strong>{confirmedName}</strong> — te enviamos la confirmación por mail.</p>
            </div>
            <button onClick={() => setConfirmed(false)} className="ml-auto text-green-400 hover:text-green-600"><X size={16} /></button>
          </div>
        </div>
      )}

      {menuItems.length === 0 && (
        <div className="container-xl py-20 text-center">
          <p className="text-warm-400 text-lg">No hay menú disponible para hoy.</p>
        </div>
      )}

      {/* Grilla */}
      <div className="container-xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((menu) => {
            const { price, discount, promo } = getEffectivePrice(menu);
            return (
              <div key={menu.id}
                onClick={() => { setSelected(menu.id); setError(null); }}
                className={`bg-white rounded-2xl overflow-hidden border-2 cursor-pointer transition-all card-lift ${
                  selected === menu.id ? "border-terracotta-500 shadow-warm-md" : "border-cream-200 shadow-card hover:border-terracotta-200"
                }`}>
                <div className="relative h-44 img-zoom">
                  <Image src={menu.image_url ?? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"} alt={menu.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <button onClick={(e) => { e.stopPropagation(); toggleFav(menu.id); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                    <Heart size={14} className={favorites.includes(menu.id) ? "text-red-500 fill-red-500" : "text-warm-400"} />
                  </button>
                  {selected === menu.id && (
                    <div className="absolute inset-0 bg-terracotta-500/20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-terracotta-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                    </div>
                  )}
                  {promo && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-terracotta-500 text-white text-xs font-bold rounded-full">
                        {promo.discountType === "percentage" ? `${promo.discountValue}% OFF` : `-$${promo.discountValue}`}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                    {menu.tags.slice(0, 2).map((t) => (
                      <span key={t} className="px-3 py-1 bg-terracotta-500/90 text-white text-xs font-medium rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-graphite-800 text-sm mb-1 leading-tight">{menu.name}</h3>
                  <p className="text-warm-400 text-xs leading-relaxed mb-2 line-clamp-1">{menu.description}</p>
                  <div className="flex items-center justify-between">
                    {menu.calories ? (
                      <span className="flex items-center gap-1 text-xs text-warm-400"><Flame size={11} className="text-terracotta-400" /> {menu.calories} kcal</span>
                    ) : <span />}
                    <div className="text-right">
                      {discount > 0 && (
                        <p className="text-warm-300 text-xs line-through">${menu.segmentPrice.toLocaleString("es-AR")}</p>
                      )}
                      <span className="text-terracotta-600 font-bold text-sm">${price.toLocaleString("es-AR")}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal confirmación */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-graphite-900/50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-48">
              <Image src={selectedMenu.image_url ?? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"} alt={selectedMenu.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/80 to-transparent" />
              <button onClick={() => { setSelected(null); setError(null); }}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"><X size={16} /></button>
              <div className="absolute bottom-4 left-4">
                <h2 className="text-xl font-bold text-white">{selectedMenu.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const { price, discount } = getEffectivePrice(selectedMenu);
                    return (
                      <>
                        {discount > 0 && <span className="text-cream-400 text-sm line-through">${selectedMenu.segmentPrice.toLocaleString("es-AR")}</span>}
                        <span className="text-terracotta-300 font-bold">${price.toLocaleString("es-AR")}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-warm-500 text-sm mb-4">{selectedMenu.description}</p>

              {/* Información nutricional */}
              {(selectedMenu.calories || selectedMenu.protein || selectedMenu.carbs || selectedMenu.fat) && (
                <div className="bg-cream-50 border border-cream-200 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-graphite-600 uppercase tracking-wider mb-3">Información nutricional</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: "Calorías", value: selectedMenu.calories, unit: "kcal", color: "text-terracotta-600" },
                      { label: "Proteínas", value: selectedMenu.protein, unit: "g", color: "text-blue-600" },
                      { label: "Carbos", value: selectedMenu.carbs, unit: "g", color: "text-amber-600" },
                      { label: "Grasas", value: selectedMenu.fat, unit: "g", color: "text-green-600" },
                    ].map((n) => n.value != null && (
                      <div key={n.label} className="text-center bg-white rounded-lg py-2 px-1 border border-cream-200">
                        <p className={`font-bold text-sm ${n.color}`}>{n.value}<span className="text-xs font-normal text-warm-400 ml-0.5">{n.unit}</span></p>
                        <p className="text-xs text-warm-400 mt-0.5">{n.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Macros bar */}
                  {selectedMenu.protein && selectedMenu.carbs && selectedMenu.fat && (() => {
                    const total = selectedMenu.protein * 4 + selectedMenu.carbs * 4 + selectedMenu.fat * 9;
                    const pProt = total > 0 ? Math.round((selectedMenu.protein * 4 / total) * 100) : 0;
                    const pCarb = total > 0 ? Math.round((selectedMenu.carbs * 4 / total) * 100) : 0;
                    const pFat  = 100 - pProt - pCarb;
                    return (
                      <div>
                        <div className="flex rounded-full overflow-hidden h-2 mb-1.5">
                          <div className="bg-blue-400 transition-all"   style={{ width: `${pProt}%` }} />
                          <div className="bg-amber-400 transition-all"  style={{ width: `${pCarb}%` }} />
                          <div className="bg-green-400 transition-all"  style={{ width: `${pFat}%` }} />
                        </div>
                        <div className="flex gap-3 justify-center">
                          {[["bg-blue-400","Prot.",pProt],["bg-amber-400","Carbs",pCarb],["bg-green-400","Grasas",pFat]].map(([c,l,v]) => (
                            <span key={String(l)} className="flex items-center gap-1 text-xs text-warm-400">
                              <span className={`w-2 h-2 rounded-full ${c}`} />{l} {v}%
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {/* Vitamins */}
                  {selectedMenu.vitamins.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selectedMenu.vitamins.map((v) => (
                        <span key={v} className="px-2.5 py-1 bg-terracotta-50 text-terracotta-700 text-xs font-medium rounded-full border border-terracotta-100">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs font-semibold text-graphite-700 uppercase tracking-wider mb-3">Extras opcionales</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {AVAILABLE_EXTRAS.map((extra) => (
                  <button key={extra} onClick={() => toggleExtra(extra)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      extras.includes(extra) ? "bg-terracotta-500 text-white" : "bg-cream-100 text-graphite-600 hover:bg-cream-200 border border-cream-300"
                    }`}>
                    {extra}
                  </button>
                ))}
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-graphite-700 uppercase tracking-wider mb-2">Comentario o restricción</label>
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2}
                  className="input-base resize-none text-sm" placeholder="Sin cebolla, sin picante, etc." />
              </div>
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
                </div>
              )}
              <button onClick={handleConfirm} disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta-500 text-white font-bold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 transition-all">
                {isPending
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Confirmando...</>
                  : <><ShoppingCart size={18} /> Confirmar pedido</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
