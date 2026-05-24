"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Flame, Filter } from "lucide-react";
import { menus, menuCategories } from "@/lib/data";

export default function MenusPage() {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [favorites, setFavorites] = useState<number[]>([]);

  const filtered =
    activeCategory === "todos"
      ? menus
      : menus.filter((m) => m.category === activeCategory || m.tags.includes(activeCategory));

  const toggleFav = (id: number) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  return (
    <>
      {/* HEADER */}
      <section className="bg-graphite-800 pt-28 pb-14">
        <div className="container-xl text-center">
          <div className="divider-gold mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-cream-100 mb-4">Menú de la semana</h1>
          <p className="text-warm-400 text-xl max-w-xl mx-auto">
            Menú rotativo semanal. Todos los platos preparados el mismo día con ingredientes frescos.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <span className="px-3 py-1.5 bg-graphite-700 text-warm-300 text-sm rounded-full border border-graphite-600">
              Lunes a viernes
            </span>
            <span className="px-3 py-1.5 bg-terracotta-500/20 text-terracotta-300 text-sm rounded-full border border-terracotta-500/30">
              Corte: 10:00 hs
            </span>
            <span className="px-3 py-1.5 bg-graphite-700 text-warm-300 text-sm rounded-full border border-graphite-600">
              Entrega: 12:30 hs
            </span>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <div className="sticky top-16 lg:top-20 z-40 bg-cream-100 border-b border-cream-200 shadow-sm">
        <div className="container-xl py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <Filter size={16} className="text-warm-400 flex-shrink-0" />
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-terracotta-500 text-white shadow-md"
                    : "bg-white text-graphite-600 hover:bg-cream-200 border border-cream-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRILLA DE MENÚS */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <p className="text-warm-400 text-sm mb-8">
            {filtered.length} {filtered.length === 1 ? "plato" : "platos"} disponibles
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((menu) => (
              <div key={menu.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-cream-200 card-lift group">
                <div className="relative h-52 img-zoom">
                  <Image src={menu.image} alt={menu.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Fav button */}
                  <button
                    onClick={() => toggleFav(menu.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <Heart
                      size={15}
                      className={favorites.includes(menu.id) ? "text-red-500 fill-red-500" : "text-warm-400"}
                    />
                  </button>

                  {/* Tags */}
                  <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                    {menu.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-terracotta-500/90 text-white text-xs font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-graphite-800 text-base leading-tight">{menu.name}</h3>
                  </div>
                  <p className="text-warm-500 text-xs leading-relaxed mb-3 line-clamp-2">{menu.description}</p>

                  <div className="flex items-center gap-2 text-xs text-warm-400 mb-4">
                    <Flame size={12} className="text-terracotta-400" />
                    <span>{menu.calories} kcal</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                    <span className="text-terracotta-600 font-bold text-lg">
                      ${menu.price.toLocaleString()}
                    </span>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta-500 text-white text-xs font-semibold rounded-lg hover:bg-terracotta-600 transition-colors"
                    >
                      <ShoppingCart size={13} />
                      Pedir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-warm-400 text-lg">No hay platos con ese filtro esta semana.</p>
              <button onClick={() => setActiveCategory("todos")} className="mt-4 text-terracotta-600 font-semibold hover:underline">
                Ver todos los platos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* INFO ADICIONAL */}
      <section className="py-12 bg-cream-200 border-t border-cream-300">
        <div className="container-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { title: "¿Ya tenés cuenta?", desc: "Ingresá al portal para hacer tu pedido del día.", cta: "Ingresar", href: "/login" },
              { title: "¿Empresa nueva?", desc: "Solicitá una degustación gratuita para tu equipo.", cta: "Degustación", href: "/degustaciones" },
              { title: "¿Tenés dudas?", desc: "Hablamos por WhatsApp o te enviamos la propuesta.", cta: "Contactar", href: "/contacto" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-card border border-cream-200">
                <h3 className="font-bold text-graphite-800 mb-2">{item.title}</h3>
                <p className="text-warm-500 text-sm mb-4">{item.desc}</p>
                <Link href={item.href} className="text-terracotta-600 font-semibold text-sm hover:text-terracotta-700 transition-colors">
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
