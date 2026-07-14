"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Plus, Minus, ShoppingBag, X, Flame, Star, Search,
  Leaf, Sprout, WheatOff, Beef, Salad, Users,
} from "lucide-react";
import type { DeliveryMenu } from "@/lib/db-delivery";

const WHATSAPP_PHONE = "5491128999904";
const CART_KEY = "bengal-delivery-cart-v1";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80";

const CATEGORIES: { id: string; label: string }[] = [
  { id: "populares", label: "⭐ Populares" },
  { id: "entrada",   label: "Entradas" },
  { id: "almuerzo",  label: "Principales" },
  { id: "ensalada",  label: "Ensaladas" },
  { id: "extra",     label: "Guarniciones" },
  { id: "postre",    label: "Postres" },
  { id: "bebida",    label: "Bebidas" },
];

const DIET_FILTERS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: "veggie",         label: "Veggie",         icon: <Leaf size={12} /> },
  { id: "vegano",         label: "Vegano",         icon: <Sprout size={12} /> },
  { id: "sin-tacc",       label: "Sin TACC",       icon: <WheatOff size={12} /> },
  { id: "keto",           label: "Keto",           icon: <Beef size={12} /> },
  { id: "light",          label: "Light",          icon: <Salad size={12} /> },
  { id: "para-compartir", label: "Para compartir", icon: <Users size={12} /> },
];

const TAG_BADGE: Record<string, { label: string; cls: string }> = {
  "veggie":         { label: "Veggie",    cls: "bg-green-900/50 text-green-300 border-green-700/50" },
  "vegano":         { label: "Vegano",    cls: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50" },
  "sin-tacc":       { label: "Sin TACC",  cls: "bg-amber-900/40 text-amber-300 border-amber-700/50" },
  "keto":           { label: "Keto",      cls: "bg-rose-900/40 text-rose-300 border-rose-700/50" },
  "light":          { label: "Light",     cls: "bg-sky-900/40 text-sky-300 border-sky-700/50" },
  "para-compartir": { label: "Compartir", cls: "bg-purple-900/40 text-purple-300 border-purple-700/50" },
};

type CartItem = { id: string; name: string; price: number; qty: number };

function money(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export default function DeliveryStore({ menus }: { menus: DeliveryMenu[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [dietFilter, setDietFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState({ nombre: "", direccion: "", notas: "" });
  const [loaded, setLoaded] = useState(false);

  // Persistencia del carrito
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch { /* carrito corrupto: empezar de cero */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, loaded]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menus.filter((m) => {
      if (dietFilter && !m.tags.includes(dietFilter)) return false;
      if (q && !`${m.name} ${m.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [menus, dietFilter, query]);

  const sections = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.id === "populares"
        ? filtered.filter((m) => m.popular)
        : filtered.filter((m) => m.category === cat.id),
    })).filter((s) => s.items.length > 0);
  }, [filtered]);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const qtyOf = (id: string) => cart.find((i) => i.id === id)?.qty ?? 0;

  const add = (m: DeliveryMenu) =>
    setCart((prev) => {
      const found = prev.find((i) => i.id === m.id);
      if (found) return prev.map((i) => (i.id === m.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: m.id, name: m.name, price: m.price, qty: 1 }];
    });

  const remove = (id: string) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
    );

  const sendWhatsApp = () => {
    const lines = [
      "*Pedido Bengal Delivery* 🐅",
      "─────────────",
      ...cart.map((i) => `${i.qty}× ${i.name} — ${money(i.price * i.qty)}`),
      "─────────────",
      `*Total: ${money(totalPrice)}*`,
      "",
      customer.nombre && `Nombre: ${customer.nombre}`,
      customer.direccion && `Dirección: ${customer.direccion}`,
      customer.notas && `Notas: ${customer.notas}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines)}`, "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-10">
      {/* ── Barra de navegación de categorías + filtros ── */}
      <div className="sticky top-16 z-40 bg-[#0B0A09]/95 backdrop-blur py-4 -mx-5 px-5 lg:-mx-10 lg:px-10 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#cat-${s.id}`}
              className="flex-shrink-0 px-4 py-2 text-[11px] uppercase tracking-[0.15em] border border-white/10 text-[#B7AD9C] hover:border-[#C9A45C]/60 hover:text-[#C9A45C] transition-colors whitespace-nowrap"
            >
              {s.label}
            </a>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-3 items-center">
          <div className="flex-shrink-0 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B7AD9C]/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="bg-white/5 border border-white/10 pl-8 pr-3 py-1.5 text-sm text-[#EDE6DA] placeholder:text-[#B7AD9C]/50 focus:border-[#C9A45C]/60 focus:outline-none w-36 focus:w-48 transition-all"
            />
          </div>
          {DIET_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setDietFilter(dietFilter === f.id ? null : f.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap ${
                dietFilter === f.id
                  ? "bg-[#C9A45C] text-[#0B0A09] border-[#C9A45C] font-medium"
                  : "border-white/10 text-[#B7AD9C] hover:border-[#C9A45C]/60 hover:text-[#C9A45C]"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Secciones de platos ── */}
      {sections.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-3xl mb-3">🍽️</p>
          <p className="text-[#B7AD9C] font-light">
            Nada por acá con esos filtros… probá aflojando alguno.
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <section key={section.id} id={`cat-${section.id}`} className="pt-12 scroll-mt-40">
            <h2
              className="text-2xl md:text-3xl font-light mb-6"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {section.label}
              <span className="text-[#B7AD9C]/60 text-sm ml-3 font-normal" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
                {section.items.length} {section.items.length === 1 ? "plato" : "platos"}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((m) => {
                const qty = qtyOf(m.id);
                return (
                  <div
                    key={`${section.id}-${m.id}`}
                    className="group bg-[#121009] border border-white/10 hover:border-[#C9A45C]/50 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={m.image_url ?? FALLBACK_IMG}
                        alt={m.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09]/70 to-transparent" />
                      {m.popular && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-[#C9A45C] text-[#0B0A09] text-[10px] font-semibold uppercase tracking-wider">
                          <Star size={10} className="fill-[#0B0A09]" /> Popular
                        </span>
                      )}
                      {m.calories !== null && m.calories > 0 && (
                        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur text-[#EDE6DA] text-[10px]">
                          <Flame size={9} className="text-[#C9A45C]" /> {m.calories} kcal
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-normal text-lg leading-snug mb-1.5" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                        {m.name}
                      </h3>
                      {m.description && (
                        <p className="text-[#B7AD9C] font-light text-[13px] leading-relaxed mb-3 line-clamp-3">
                          {m.description}
                        </p>
                      )}
                      {m.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {m.tags.map((t) =>
                            TAG_BADGE[t] ? (
                              <span key={t} className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${TAG_BADGE[t].cls}`}>
                                {TAG_BADGE[t].label}
                              </span>
                            ) : null
                          )}
                        </div>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[#C9A45C] text-lg font-medium">{money(m.price)}</span>
                        {qty === 0 ? (
                          <button
                            onClick={() => add(m)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C9A45C] text-[#0B0A09] text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-[#D8B76F] transition-colors"
                          >
                            <Plus size={13} /> Agregar
                          </button>
                        ) : (
                          <div className="inline-flex items-center border border-[#C9A45C]/60">
                            <button onClick={() => remove(m.id)} className="px-3 py-2 text-[#C9A45C] hover:bg-[#C9A45C]/10 transition-colors">
                              <Minus size={13} />
                            </button>
                            <span className="px-2 text-sm font-medium text-[#EDE6DA] min-w-[24px] text-center">{qty}</span>
                            <button onClick={() => add(m)} className="px-3 py-2 text-[#C9A45C] hover:bg-[#C9A45C]/10 transition-colors">
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* ── Barra flotante del pedido ── */}
      {totalItems > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-[#C9A45C] text-[#0B0A09] shadow-2xl shadow-black/50 hover:bg-[#D8B76F] transition-all min-w-[300px] justify-between"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <ShoppingBag size={16} />
            {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">Ver mi pedido</span>
          <span className="text-sm font-semibold">{money(totalPrice)}</span>
        </button>
      )}

      {/* ── Panel del pedido ── */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setCartOpen(false)} />
          <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[#121009] border-l border-white/10 z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="text-2xl font-light" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                Tu pedido
              </h2>
              <button onClick={() => setCartOpen(false)} className="text-[#B7AD9C] hover:text-[#C9A45C] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-3xl mb-3">🍮</p>
                  <p className="text-[#B7AD9C] font-light text-sm">
                    Tu bandeja está vacía…<br />el flan no se va a pedir solo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#EDE6DA] truncate">{i.name}</p>
                        <p className="text-[#C9A45C] text-sm">{money(i.price * i.qty)}</p>
                      </div>
                      <div className="inline-flex items-center border border-white/15 flex-shrink-0">
                        <button onClick={() => remove(i.id)} className="px-2.5 py-1.5 text-[#C9A45C] hover:bg-white/5"><Minus size={12} /></button>
                        <span className="px-2 text-sm min-w-[22px] text-center">{i.qty}</span>
                        <button onClick={() => setCart((p) => p.map((x) => x.id === i.id ? { ...x, qty: x.qty + 1 } : x))} className="px-2.5 py-1.5 text-[#C9A45C] hover:bg-white/5"><Plus size={12} /></button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-5 mt-5 border-t border-white/10 space-y-3">
                    <input
                      value={customer.nombre}
                      onChange={(e) => setCustomer({ ...customer, nombre: e.target.value })}
                      placeholder="Tu nombre"
                      className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm placeholder:text-[#B7AD9C]/50 focus:border-[#C9A45C]/60 focus:outline-none"
                    />
                    <input
                      value={customer.direccion}
                      onChange={(e) => setCustomer({ ...customer, direccion: e.target.value })}
                      placeholder="Dirección de entrega"
                      className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm placeholder:text-[#B7AD9C]/50 focus:border-[#C9A45C]/60 focus:outline-none"
                    />
                    <textarea
                      value={customer.notas}
                      onChange={(e) => setCustomer({ ...customer, notas: e.target.value })}
                      placeholder="Notas (timbre roto, sin sal, etc.)"
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm placeholder:text-[#B7AD9C]/50 focus:border-[#C9A45C]/60 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-6 py-5 border-t border-white/10 bg-[#0B0A09]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#B7AD9C] text-sm uppercase tracking-[0.2em]">Total</span>
                  <span className="text-[#C9A45C] text-2xl font-medium">{money(totalPrice)}</span>
                </div>
                <button
                  onClick={sendWhatsApp}
                  className="w-full py-4 bg-[#25D366] text-[#0B0A09] text-[12px] uppercase tracking-[0.2em] font-semibold hover:bg-[#2EE476] transition-colors"
                >
                  Enviar pedido por WhatsApp
                </button>
                <p className="text-center text-[#B7AD9C]/60 text-[11px] mt-3 font-light">
                  Confirmamos zona, tiempo y pago por WhatsApp.
                </p>
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}
