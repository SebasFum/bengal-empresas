"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CheckCircle, Clock, ChefHat, Send, Flame, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/admin";

// Campana de cocina sintetizada — no requiere archivo de audio
function playKitchenBell() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.18, 0.36].forEach((delay, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = i === 2 ? 1175 : 880; // dos tonos + remate más agudo
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // audio bloqueado por el navegador — el cartel visual sigue funcionando
  }
}

type KitchenOrder = {
  id: string;
  status: "pendiente" | "en_produccion";
  extras: string[];
  notes: string | null;
  total: number;
  created_at: string;
  segment: string | null;
  menuId: string;
  menuName: string;
  userName: string;
};

type GroupedMenu = {
  menuName: string;
  menuId: string;
  orders: KitchenOrder[];
  pendingCount: number;
  inProductionCount: number;
};

const SEGMENT_LABEL: Record<string, string> = {
  empresa: "🏢", hogar: "🏠", eventos: "🎉",
};

type Props = {
  initialOrders: KitchenOrder[];
  dispatchedCount: number;
  today: string;
  staffName: string;
};

export default function CocinaClient({ initialOrders, dispatchedCount, today, staffName }: Props) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [dispatched, setDispatched] = useState(dispatchedCount);
  const [view, setView] = useState<"grupos" | "lista">("grupos");
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);
  soundOnRef.current = soundOn;
  const prevOrderIds = useRef(new Set(initialOrders.map((o) => o.id)));

  const todayLabel = new Date(today + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  // ─── Polling (cada 12 s) ───────────────────────────────────
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/kitchen/orders?date=${today}`);
        if (!res.ok) return;
        const data = await res.json() as { orders: KitchenOrder[]; dispatchedCount: number };
        const newIds = new Set(data.orders.map((o) => o.id));
        const hasNew = data.orders.some((o) => !prevOrderIds.current.has(o.id));
        prevOrderIds.current = newIds;
        setOrders(data.orders);
        setDispatched(data.dispatchedCount);
        if (hasNew) {
          setNewOrderAlert(true);
          if (soundOnRef.current) playKitchenBell();
          setTimeout(() => setNewOrderAlert(false), 4000);
        }
      } catch {
        // silent — cocina sigue funcionando con datos previos
      }
    };

    const id = setInterval(poll, 12_000);
    return () => clearInterval(id);
  }, [today]);

  // ─── Acciones ──────────────────────────────────────────────
  const markInProduction = useCallback(async (orderId: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "en_produccion" } : o));
    await updateOrderStatus(orderId, "en_produccion");
  }, []);

  const markDispatched = useCallback(async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setDispatched((d) => d + 1);
    await updateOrderStatus(orderId, "en_camino");
  }, []);

  // ─── Agrupación por menú ───────────────────────────────────
  const grouped: GroupedMenu[] = Object.values(
    orders.reduce<Record<string, GroupedMenu>>((acc, o) => {
      if (!acc[o.menuId]) {
        acc[o.menuId] = { menuName: o.menuName, menuId: o.menuId, orders: [], pendingCount: 0, inProductionCount: 0 };
      }
      acc[o.menuId].orders.push(o);
      if (o.status === "pendiente") acc[o.menuId].pendingCount++;
      else acc[o.menuId].inProductionCount++;
      return acc;
    }, {})
  ).sort((a, b) => b.orders.length - a.orders.length);

  const pendingTotal = orders.filter((o) => o.status === "pendiente").length;
  const inProdTotal = orders.filter((o) => o.status === "en_produccion").length;

  return (
    <div className="min-h-screen bg-graphite-900 text-cream-100">
      {/* Header */}
      <div className="bg-graphite-800 border-b border-graphite-700 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-terracotta-500 rounded-xl flex items-center justify-center">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-cream-100 text-lg leading-tight">Pantalla de Cocina</h1>
              <p className="text-warm-400 text-xs capitalize">{todayLabel} · {staffName}</p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-gold-900/40 border border-gold-700 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold text-gold-400">{pendingTotal}</p>
              <p className="text-xs text-gold-500">Pendientes</p>
            </div>
            <div className="bg-purple-900/40 border border-purple-700 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold text-purple-400">{inProdTotal}</p>
              <p className="text-xs text-purple-400">En producción</p>
            </div>
            <div className="bg-green-900/40 border border-green-700 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold text-green-400">{dispatched}</p>
              <p className="text-xs text-green-500">Despachados</p>
            </div>
          </div>

          {/* Vista toggle + sonido */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { const next = !soundOn; setSoundOn(next); if (next) playKitchenBell(); }}
              title={soundOn ? "Silenciar aviso sonoro" : "Activar aviso sonoro"}
              className={`p-2 rounded-lg transition-colors ${soundOn ? "bg-terracotta-500/20 text-terracotta-300 hover:bg-terracotta-500/30" : "bg-graphite-700 text-warm-500 hover:text-warm-300"}`}>
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <div className="flex gap-1 p-1 bg-graphite-700 rounded-lg">
              {(["grupos", "lista"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${view === v ? "bg-terracotta-500 text-white" : "text-warm-400 hover:text-cream-200"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta nuevo pedido */}
      {newOrderAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-terracotta-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold">
            <AlertCircle size={18} /> ¡Nuevo pedido entrante!
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-24">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4 opacity-60" />
            <p className="text-warm-400 text-xl font-semibold">Todo al día</p>
            <p className="text-warm-500 text-sm mt-2">No hay pedidos pendientes. {dispatched > 0 && `${dispatched} despachados hoy.`}</p>
          </div>
        ) : view === "grupos" ? (
          /* ─── Vista agrupada por plato ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {grouped.map((group) => (
              <div key={group.menuId} className="bg-graphite-800 rounded-2xl border border-graphite-700 overflow-hidden">
                {/* Header del grupo */}
                <div className="px-5 py-4 border-b border-graphite-700 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-cream-100">{group.menuName}</h2>
                    <p className="text-warm-400 text-xs mt-0.5">
                      {group.orders.length} {group.orders.length === 1 ? "pedido" : "pedidos"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {group.pendingCount > 0 && (
                      <span className="px-2.5 py-1 bg-gold-900/60 text-gold-400 text-xs font-bold rounded-lg border border-gold-700">
                        {group.pendingCount} pend.
                      </span>
                    )}
                    {group.inProductionCount > 0 && (
                      <span className="px-2.5 py-1 bg-purple-900/60 text-purple-400 text-xs font-bold rounded-lg border border-purple-700">
                        {group.inProductionCount} prod.
                      </span>
                    )}
                  </div>
                </div>

                {/* Pedidos del grupo */}
                <div className="divide-y divide-graphite-700">
                  {group.orders.map((order) => (
                    <div key={order.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{SEGMENT_LABEL[order.segment ?? ""] ?? "👤"}</span>
                            <span className="font-medium text-cream-200 text-sm">{order.userName}</span>
                          </div>
                          {order.extras.length > 0 && (
                            <p className="text-xs text-terracotta-300 mt-0.5">+ {order.extras.join(", ")}</p>
                          )}
                          {order.notes && (
                            <p className="text-xs text-gold-400 mt-0.5 flex items-start gap-1">
                              <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
                              {order.notes}
                            </p>
                          )}
                        </div>
                        <span className="text-warm-500 text-xs whitespace-nowrap">
                          {new Date(order.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Botones de acción */}
                      {order.status === "pendiente" ? (
                        <button onClick={() => markInProduction(order.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors">
                          <Flame size={13} /> Comenzar preparación
                        </button>
                      ) : (
                        <button onClick={() => markDispatched(order.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors">
                          <Send size={13} /> Despachar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ─── Vista lista cronológica ─── */
          <div className="bg-graphite-800 rounded-2xl border border-graphite-700 overflow-hidden">
            <div className="divide-y divide-graphite-700">
              {orders.map((order, idx) => (
                <div key={order.id} className={`flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 ${order.status === "en_produccion" ? "bg-purple-900/20" : ""}`}>
                  <div className="w-8 h-8 rounded-lg bg-graphite-700 flex items-center justify-center text-warm-400 text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-cream-100">{order.menuName}</span>
                      <span className="text-sm">{SEGMENT_LABEL[order.segment ?? ""] ?? ""}</span>
                    </div>
                    <p className="text-warm-400 text-xs mt-0.5">{order.userName}
                      {order.extras.length > 0 && <span className="text-terracotta-300"> · +{order.extras.join(", ")}</span>}
                    </p>
                    {order.notes && (
                      <p className="text-gold-400 text-xs mt-0.5 flex items-center gap-1">
                        <AlertCircle size={11} /> {order.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-warm-500 text-xs">
                      <Clock size={11} className="inline mr-0.5" />
                      {new Date(order.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {order.status === "pendiente" ? (
                      <button onClick={() => markInProduction(order.id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                        <Flame size={12} /> Preparar
                      </button>
                    ) : (
                      <button onClick={() => markDispatched(order.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                        <Send size={12} /> Despachar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
