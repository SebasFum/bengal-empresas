"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sparkles, Clock, CalendarCheck, ChefHat, Leaf, WheatOff } from "lucide-react";

type Order = { menu_id: string; date: string; menu_name: string };

type BannerState =
  | { type: "loading" }
  | { type: "guest" }
  | { type: "personal"; firstName: string; suggestion: Suggestion; dietary: string[] };

type Suggestion =
  | { kind: "repeat"; menuName: string; menuId: string; daysSince: number }
  | { kind: "welcome" }
  | { kind: "closed"; hasHistory: boolean; firstName: string }
  | { kind: "prebook" };

function daysBetween(a: string, b: Date) {
  return Math.floor((b.getTime() - new Date(a).getTime()) / 86_400_000);
}

function mostFrequent(orders: Order[]) {
  if (!orders.length) return null;
  const freq: Record<string, { count: number; name: string }> = {};
  for (const o of orders) {
    freq[o.menu_id] ??= { count: 0, name: o.menu_name };
    freq[o.menu_id].count++;
  }
  const [id, data] = Object.entries(freq).sort(([, a], [, b]) => b.count - a.count)[0] ?? [];
  if (!id) return null;
  return { menu_id: id, name: data.name, count: data.count };
}

const DIETARY_LABELS: Record<string, { label: string; icon: ReactNode }> = {
  sin_tacc: { label: "Sin TACC", icon: <WheatOff size={12} /> },
  vegetariano: { label: "Vegetariano", icon: <Leaf size={12} /> },
  vegano: { label: "Vegano", icon: <Leaf size={12} /> },
};

export default function SmartBanner() {
  const { data: session, status } = useSession();
  const [state, setState] = useState<BannerState>({ type: "loading" });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !session?.user) {
      setState({ type: "guest" });
      return;
    }

    (async () => {
      const firstName = session.user.name?.split(" ")[0] ?? "allá";
      const now = new Date();
      const h = now.getHours();
      const closedToday = h >= 10;

      let dietary: string[] = [];
      let orders: Order[]   = [];

      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch(`/api/user/profile`),
          fetch(`/api/user/orders?limit=10`),
        ]);
        if (profileRes.ok) { const p = await profileRes.json(); dietary = p.dietary_restrictions ?? []; }
        if (ordersRes.ok)  { orders = await ordersRes.json(); }
      } catch { /* non-fatal */ }

      const top      = mostFrequent(orders);
      const lastOrder = orders[0];
      const daysSince = lastOrder ? daysBetween(lastOrder.date, now) : 999;

      let suggestion: Suggestion;
      if (closedToday) {
        suggestion = { kind: "closed", hasHistory: orders.length > 0, firstName };
      } else if (top && top.count >= 2) {
        suggestion = { kind: "repeat", menuName: top.name, menuId: top.menu_id, daysSince };
      } else {
        suggestion = { kind: "welcome" };
      }

      setState({ type: "personal", firstName, suggestion, dietary });
    })();
  }, [session, status]);

  // invisible during SSR and for guests
  if (state.type === "loading" || state.type === "guest") return null;
  const { firstName, suggestion, dietary } = state;

  return (
    <div className="bg-graphite-800 border-b border-graphite-700">
      <div className="container-xl py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 flex-shrink-0 bg-terracotta-500/20 rounded-xl flex items-center justify-center mt-0.5">
              <BannerIcon suggestion={suggestion} />
            </div>
            <div>
              <BannerMessage firstName={firstName} suggestion={suggestion} />
              {dietary.length > 0 && (
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {dietary.map((d) =>
                    DIETARY_LABELS[d] ? (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/15 text-green-400 rounded-full text-[10px] font-semibold border border-green-500/20"
                      >
                        {DIETARY_LABELS[d].icon}
                        {DIETARY_LABELS[d].label}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>

          <BannerCTA suggestion={suggestion} />
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BannerIcon({ suggestion }: { suggestion: Suggestion }) {
  if (suggestion.kind === "repeat") return <ChefHat size={16} className="text-terracotta-400" />;
  if (suggestion.kind === "closed") return <Clock size={16} className="text-warm-400" />;
  if (suggestion.kind === "prebook") return <CalendarCheck size={16} className="text-terracotta-400" />;
  return <Sparkles size={16} className="text-terracotta-400" />;
}

function BannerMessage({ firstName, suggestion }: { firstName: string; suggestion: Suggestion }) {
  if (suggestion.kind === "repeat") {
    const freq = suggestion.daysSince <= 7 ? "esta semana pediste" : "la última vez pediste";
    return (
      <>
        <p className="text-cream-200 text-sm font-semibold">
          Hola {firstName}! {" "}
          <span className="text-terracotta-400">{suggestion.menuName}</span>
        </p>
        <p className="text-warm-400 text-xs mt-0.5">
          Es tu plato más frecuente ({freq}). ¿Lo pedimos hoy?
        </p>
      </>
    );
  }

  if (suggestion.kind === "closed") {
    return (
      <>
        <p className="text-cream-200 text-sm font-semibold">
          Hola {firstName} — los pedidos de hoy ya cerraron.
        </p>
        <p className="text-warm-400 text-xs mt-0.5">
          {suggestion.hasHistory
            ? "Pre-reservá para mañana o revisá tu historial."
            : "Reservá un menú para mañana o consultá por eventos."}
        </p>
      </>
    );
  }

  if (suggestion.kind === "prebook") {
    return (
      <>
        <p className="text-cream-200 text-sm font-semibold">
          ¿Querés asegurar tu lugar para mañana, {firstName}?
        </p>
        <p className="text-warm-400 text-xs mt-0.5">
          Pre-reservá ahora y recibís confirmación al instante.
        </p>
      </>
    );
  }

  // welcome
  return (
    <>
      <p className="text-cream-200 text-sm font-semibold">
        Bienvenido, {firstName}! El menú de hoy ya está disponible.
      </p>
      <p className="text-warm-400 text-xs mt-0.5">
        Hacé tu pedido antes de las 10:00 para asegurar tu vianda.
      </p>
    </>
  );
}

function BannerCTA({ suggestion }: { suggestion: Suggestion }) {
  if (suggestion.kind === "repeat") {
    return (
      <Link
        href="/pedidos"
        className="flex-shrink-0 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors whitespace-nowrap"
      >
        Pedir ahora
      </Link>
    );
  }

  if (suggestion.kind === "closed") {
    return (
      <div className="flex gap-2 flex-shrink-0">
        <Link
          href="/historial"
          className="px-4 py-2 border border-graphite-600 text-warm-300 text-sm font-medium rounded-xl hover:border-terracotta-500 hover:text-terracotta-400 transition-colors whitespace-nowrap"
        >
          Mi historial
        </Link>
        <Link
          href="/eventos"
          className="px-4 py-2 bg-terracotta-500/20 text-terracotta-300 border border-terracotta-500/30 text-sm font-medium rounded-xl hover:bg-terracotta-500/30 transition-colors whitespace-nowrap"
        >
          Ver eventos
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/pedidos"
      className="flex-shrink-0 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors whitespace-nowrap"
    >
      Hacer pedido
    </Link>
  );
}
