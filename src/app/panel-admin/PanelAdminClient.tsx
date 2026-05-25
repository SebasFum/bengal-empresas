"use client";

import { useState, useTransition } from "react";
import { ShoppingBag, Users, TrendingUp } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/admin";

const STATUS_STYLES: Record<string, string> = {
  entregado:     "bg-green-100 text-green-700",
  en_camino:     "bg-blue-100 text-blue-700",
  en_produccion: "bg-purple-100 text-purple-700",
  pendiente:     "bg-gold-100 text-gold-700",
  cancelado:     "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente", en_produccion: "En producción",
  en_camino: "En camino", entregado: "Entregado", cancelado: "Cancelado",
};

const STATUS_FLOW = ["pendiente", "en_produccion", "en_camino", "entregado"] as const;

export type TodayOrder = {
  id: string; date: string; status: string; total: number;
  extras: string[]; notes: string | null; created_at: string;
  menuName: string; userName: string | null;
};

export type DailyMenuRow = {
  id: string; date: string; stock: number; orders_count: number;
  menus: { id: string; name: string; category: string; price: number; active: boolean } | null;
};

export type CompanyRow = {
  id: string; name: string; contact_email: string | null;
  active: boolean; delivery_time: string; budget_per_person: number | null;
};

type Props = {
  stats: { todayOrders: number; activeCompanies: number; revenueToday: number };
  dailyMenus: DailyMenuRow[];
  todayOrders: TodayOrder[];
  companies: CompanyRow[];
  today: string;
};

export default function PanelAdminClient({ stats, dailyMenus, todayOrders, companies, today }: Props) {
  const [activeTab, setActiveTab] = useState<"menus" | "pedidos" | "empresas">("pedidos");
  const [orders, setOrders] = useState(todayOrders);
  const [isPending, startTransition] = useTransition();

  const todayLabel = new Date(today + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const advanceStatus = (orderId: string, currentStatus: string) => {
    const idx = STATUS_FLOW.indexOf(currentStatus as typeof STATUS_FLOW[number]);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[idx + 1];
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);
      if (result.success) {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
      }
    });
  };

  return (
    <div className="min-h-screen bg-cream-100 pt-16">
      <div className="bg-graphite-800 text-cream-100">
        <div className="container-xl py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-warm-400 uppercase tracking-wider">Administración</span>
              <h1 className="text-2xl font-bold text-cream-100 mt-0.5">Panel Bengal</h1>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-graphite-700 rounded-full border border-graphite-600 text-warm-300">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Sistema operativo
              </span>
              <span className="px-3 py-1.5 bg-graphite-700 rounded-full border border-graphite-600 text-warm-300 capitalize">
                {todayLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pedidos hoy", value: stats.todayOrders, icon: ShoppingBag, color: "text-terracotta-600 bg-terracotta-50" },
            { label: "Empresas activas", value: stats.activeCompanies, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Facturación hoy", value: `$${stats.revenueToday.toLocaleString("es-AR")}`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-card border border-cream-200">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <p className="text-xs text-warm-400 mb-0.5">{s.label}</p>
              <p className="font-bold text-graphite-800 text-xl">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-cream-200 rounded-xl mb-6 w-fit">
          {(["pedidos", "menus", "empresas"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-white text-graphite-800 shadow-sm" : "text-warm-500 hover:text-graphite-700"}`}>
              {tab === "menus" ? "Menús" : tab === "pedidos" ? `Pedidos (${orders.length})` : "Empresas"}
            </button>
          ))}
        </div>

        {/* Tab: Pedidos */}
        {activeTab === "pedidos" && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800">Pedidos del día</h2>
              <p className="text-warm-400 text-xs mt-0.5">Clic en el estado para avanzarlo</p>
            </div>
            {orders.length === 0 ? (
              <div className="py-16 text-center text-warm-400 text-sm">No hay pedidos para hoy todavía.</div>
            ) : (
              <div className="divide-y divide-cream-100">
                {orders.map((order) => {
                  const canAdvance = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]) < STATUS_FLOW.length - 1;
                  return (
                    <div key={order.id} className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 hover:bg-cream-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-graphite-800 text-sm truncate">{order.menuName}</p>
                        <p className="text-warm-400 text-xs mt-0.5">
                          {order.userName ?? "Usuario"} · #{order.id.slice(-8).toUpperCase()}
                          {order.extras.length > 0 && ` · +${order.extras.join(", ")}`}
                          {order.notes && ` · "${order.notes}"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-graphite-800 text-sm">${order.total.toLocaleString("es-AR")}</span>
                        <button
                          onClick={() => advanceStatus(order.id, order.status)}
                          disabled={!canAdvance || isPending}
                          title={canAdvance ? `Avanzar estado` : "Estado final"}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"} ${canAdvance ? "hover:ring-2 hover:ring-offset-1 hover:ring-terracotta-400 cursor-pointer" : "cursor-default opacity-80"}`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Menús */}
        {activeTab === "menus" && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800 capitalize">Menú del día — {todayLabel}</h2>
              <p className="text-warm-400 text-xs mt-0.5">Total pedidos: {dailyMenus.reduce((s, dm) => s + dm.orders_count, 0)}</p>
            </div>
            {dailyMenus.length === 0 ? (
              <div className="py-16 text-center text-warm-400 text-sm">No hay menú configurado para hoy.</div>
            ) : (
              <div className="divide-y divide-cream-100">
                {dailyMenus.map((dm) => {
                  const remaining = dm.stock - dm.orders_count;
                  const pct = Math.min((dm.orders_count / dm.stock) * 100, 100);
                  return (
                    <div key={dm.id} className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 hover:bg-cream-50">
                      <div className="flex-1">
                        <p className="font-medium text-graphite-800">{dm.menus?.name ?? "—"}</p>
                        <p className="text-xs text-warm-400 mt-0.5 capitalize">{dm.menus?.category}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-warm-400">Pedidos</p>
                          <p className="font-bold text-graphite-800">{dm.orders_count}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-warm-400">Restante</p>
                          <p className={`font-bold ${remaining <= 5 ? "text-red-600" : "text-graphite-800"}`}>{remaining} / {dm.stock}</p>
                        </div>
                        <div className="w-24">
                          <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-gold-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Empresas */}
        {activeTab === "empresas" && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800">Empresas registradas</h2>
            </div>
            {companies.length === 0 ? (
              <div className="py-16 text-center text-warm-400 text-sm">No hay empresas registradas.</div>
            ) : (
              <div className="divide-y divide-cream-100">
                {companies.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-cream-50">
                    <div className="w-9 h-9 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 font-bold text-sm flex-shrink-0">{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-graphite-800 text-sm">{c.name}</p>
                      <p className="text-warm-400 text-xs">{c.contact_email ?? "—"} · Entrega: {c.delivery_time} hs</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {c.budget_per_person && <span className="text-xs text-warm-400 hidden md:block">${c.budget_per_person.toLocaleString("es-AR")}/persona</span>}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
