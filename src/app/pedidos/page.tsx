"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, CheckCircle, Clock, Flame, X, RefreshCw } from "lucide-react";
import { menus, menuCategories } from "@/lib/data";

export default function PedidosPage() {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([2, 4]);
  const [extras, setExtras] = useState<string[]>([]);
  const [nota, setNota] = useState("");

  const filtered =
    activeCategory === "todos"
      ? menus
      : menus.filter((m) => m.category === activeCategory || m.tags.includes(activeCategory));

  const selectedMenu = menus.find((m) => m.id === selected);

  const availableExtras = ["Ensalada extra", "Pan artesanal", "Agua mineral", "Jugo natural", "Postre del día"];

  const toggleFav = (id: number) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const toggleExtra = (e: string) =>
    setExtras((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));

  const handleConfirm = () => {
    setConfirmed(true);
    setSelected(null);
    setExtras([]);
    setNota("");
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header del portal */}
      <div className="bg-white border-b border-cream-200 pt-16 pb-0">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-graphite-800">Hacé tu pedido</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-warm-400 text-sm">Jueves 18 de enero</span>
                <span className="flex items-center gap-1 text-xs font-medium text-terracotta-600 bg-terracotta-50 px-2.5 py-1 rounded-full">
                  <Clock size={11} /> Corte: 10:00 hs
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/historial" className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-terracotta-600 transition-colors">
                <RefreshCw size={14} /> Repetir último pedido
              </Link>
              <Link href="/mi-cuenta" className="w-8 h-8 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 text-sm font-bold">
                A
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1">
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "bg-terracotta-500 text-white"
                    : "bg-cream-200 text-graphite-600 hover:bg-cream-300"
                }`}
              >
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
              <p className="text-green-600 text-sm">Tu vianda llegará mañana a las 12:30 hs. Te enviamos la confirmación por mail.</p>
            </div>
            <button onClick={() => setConfirmed(false)} className="ml-auto text-green-400 hover:text-green-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Grilla */}
      <div className="container-xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((menu) => (
            <div
              key={menu.id}
              onClick={() => setSelected(menu.id)}
              className={`bg-white rounded-2xl overflow-hidden border-2 cursor-pointer transition-all card-lift ${
                selected === menu.id
                  ? "border-terracotta-500 shadow-warm-md"
                  : "border-cream-200 shadow-card hover:border-terracotta-200"
              }`}
            >
              <div className="relative h-44 img-zoom">
                <Image src={menu.image} alt={menu.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(menu.id); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
                >
                  <Heart size={14} className={favorites.includes(menu.id) ? "text-red-500 fill-red-500" : "text-warm-400"} />
                </button>
                {selected === menu.id && (
                  <div className="absolute inset-0 bg-terracotta-500/20 flex items-center justify-center">
                    <div className="w-10 h-10 bg-terracotta-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {menu.tags.slice(0, 2).map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-terracotta-500/90 text-white text-[10px] font-medium rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-graphite-800 text-sm mb-1 leading-tight">{menu.name}</h3>
                <p className="text-warm-400 text-xs leading-relaxed mb-2 line-clamp-1">{menu.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-warm-400">
                    <Flame size={11} className="text-terracotta-400" /> {menu.calories} kcal
                  </span>
                  <span className="text-terracotta-600 font-bold text-sm">${menu.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de confirmación (sidebar) */}
      {selectedMenu && !confirmed && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-graphite-900/50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-48">
              <Image src={selectedMenu.image} alt={selectedMenu.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/80 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-4">
                <h2 className="text-xl font-bold text-white">{selectedMenu.name}</h2>
                <span className="text-terracotta-300 font-bold">${selectedMenu.price.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-warm-500 text-sm mb-5">{selectedMenu.description}</p>

              <p className="text-xs font-semibold text-graphite-700 uppercase tracking-wider mb-3">Extras opcionales</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {availableExtras.map((extra) => (
                  <button
                    key={extra}
                    onClick={() => toggleExtra(extra)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      extras.includes(extra)
                        ? "bg-terracotta-500 text-white"
                        : "bg-cream-100 text-graphite-600 hover:bg-cream-200 border border-cream-300"
                    }`}
                  >
                    {extra}
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-graphite-700 uppercase tracking-wider mb-2">
                  Comentario o restricción
                </label>
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  rows={2}
                  className="input-base resize-none text-sm"
                  placeholder="Sin cebolla, sin picante, etc."
                />
              </div>

              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta-500 text-white font-bold rounded-xl hover:bg-terracotta-600 transition-all"
              >
                <ShoppingCart size={18} /> Confirmar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
