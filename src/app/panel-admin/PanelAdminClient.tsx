"use client";

import { useState, useTransition, useRef, type Dispatch, type SetStateAction } from "react";
import {
  ShoppingBag, Users, TrendingUp, ChefHat, Package, Tag,
  Share2, PlusCircle, Pencil, Trash2, ToggleLeft, ToggleRight,
  X, Check, AlertTriangle, Download, Calendar, DollarSign,
} from "lucide-react";
import {
  updateOrderStatus, upsertMenu, deleteMenu,
  upsertDailyMenu, removeDailyMenu,
  upsertIngredient, adjustIngredientStock,
  setSegmentPrice, upsertPromotion, togglePromotion,
} from "@/app/actions/admin";

// ─── Types ────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  entregado:     "bg-green-100 text-green-700",
  en_camino:     "bg-blue-100 text-blue-700",
  en_produccion: "bg-purple-100 text-purple-700",
  pendiente:     "bg-amber-100 text-amber-700",
  cancelado:     "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente", en_produccion: "En producción",
  en_camino: "En camino", entregado: "Entregado", cancelado: "Cancelado",
};
const STATUS_FLOW = ["pendiente", "en_produccion", "en_camino", "entregado"] as const;
const SEGMENT_LABELS: Record<string, string> = { empresa: "Empresa", hogar: "Hogar", eventos: "Eventos" };
const SEGMENT_COLORS: Record<string, string> = {
  empresa: "bg-blue-50 text-blue-700", hogar: "bg-green-50 text-green-700", eventos: "bg-purple-50 text-purple-700",
};
const CATEGORIES = ["almuerzo", "entrada", "postre", "bebida", "especial"];
const SEGMENTS = ["empresa", "hogar", "eventos"] as const;

export type TodayOrder = {
  id: string; date: string; status: string; total: number;
  extras: string[]; notes: string | null; created_at: string;
  segment: string | null; menuName: string; userName: string | null;
};
export type DailyMenuRow = {
  id: string; date: string; stock: number; orders_count: number;
  menus: { id: string; name: string; category: string; price: number; active: boolean } | null;
};
export type CompanyRow = {
  id: string; name: string; contact_email: string | null;
  active: boolean; delivery_time: string; budget_per_person: number | null;
};
export type MenuRow = {
  id: string; name: string; description: string | null; category: string;
  price: number; calories: number | null; protein: number | null;
  carbs: number | null; fat: number | null; vitamins: string[];
  tags: string[]; image_url: string | null; active: boolean;
};
export type IngredientRow = {
  id: string; name: string; unit: string; current_stock: number;
  cost_per_unit: number | null; min_stock_alert: number | null;
};
export type SegmentPriceRow = { id: string; menu_id: string; segment: string; price: number; active: boolean };
export type ReportsData = {
  topDishes:  { name: string; qty: number; revenue: number }[];
  salesByDay: { date: string; qty: number; revenue: number }[];
  byCategory: { category: string; qty: number; revenue: number }[];
  topClients: { name: string; qty: number; revenue: number }[];
};
export type PromotionRow = {
  id: string; name: string; discount_type: "percentage" | "fixed"; discount_value: number;
  min_order_total: number | null; applies_to: string; valid_from: string; valid_until: string; active: boolean;
};

type Props = {
  stats: { todayOrders: number; activeCompanies: number; revenueToday: number };
  dailyMenus: DailyMenuRow[];
  todayOrders: TodayOrder[];
  companies: CompanyRow[];
  menus: MenuRow[];
  ingredients: IngredientRow[];
  segmentPrices: SegmentPriceRow[];
  promotions: PromotionRow[];
  reports: ReportsData;
  today: string;
};

type TabId = "pedidos" | "reportes" | "menudia" | "catalogo" | "ingredientes" | "precios" | "promociones" | "redes" | "empresas";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "pedidos",      label: "Pedidos",      icon: <ShoppingBag size={14} /> },
  { id: "reportes",     label: "Reportes",     icon: <TrendingUp size={14} /> },
  { id: "menudia",      label: "Menú del día", icon: <Calendar size={14} /> },
  { id: "catalogo",     label: "Catálogo",     icon: <ChefHat size={14} /> },
  { id: "ingredientes", label: "Ingredientes", icon: <Package size={14} /> },
  { id: "precios",      label: "Precios",      icon: <DollarSign size={14} /> },
  { id: "promociones",  label: "Promociones",  icon: <Tag size={14} /> },
  { id: "redes",        label: "Redes",        icon: <Share2 size={14} /> },
  { id: "empresas",     label: "Empresas",     icon: <Users size={14} /> },
];

// ─── Helpers ─────────────────────────────────────────────────
function Feedback({ msg, isError }: { msg: string; isError?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm mt-3 ${isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
      {isError ? <AlertTriangle size={14} /> : <Check size={14} />} {msg}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function PanelAdminClient({
  stats, dailyMenus: initialDailyMenus, todayOrders, companies,
  menus: initialMenus, ingredients: initialIngredients, segmentPrices: initialPrices,
  promotions: initialPromos, reports, today,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("pedidos");
  const [orders, setOrders]           = useState(todayOrders);
  const [dailyMenus, setDailyMenus]   = useState(initialDailyMenus);
  const [menus, setMenus]             = useState(initialMenus);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [prices, setPrices]           = useState(initialPrices);
  const [promos, setPromos]           = useState(initialPromos);
  const [isPending, startTransition]  = useTransition();

  const todayLabel = new Date(today + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  // ─── Order status advancement ─────────────────────────────
  const advanceStatus = (orderId: string, currentStatus: string) => {
    const idx = STATUS_FLOW.indexOf(currentStatus as typeof STATUS_FLOW[number]);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    startTransition(async () => {
      const r = await updateOrderStatus(orderId, next);
      if (r.success) setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: next } : o));
    });
  };

  return (
    <div className="min-h-screen bg-cream-100 pt-16">
      {/* ── Header ── */}
      <div className="bg-graphite-800 text-cream-100">
        <div className="container-xl py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-warm-400 uppercase tracking-wider">Administración</span>
              <h1 className="text-2xl font-bold text-cream-100 mt-0.5">Panel Bengal</h1>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
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
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 bg-cream-200 rounded-xl mb-6 overflow-x-auto w-full">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white text-graphite-800 shadow-sm" : "text-warm-500 hover:text-graphite-700"}`}>
              {tab.icon}{tab.label}{tab.id === "pedidos" ? ` (${orders.length})` : ""}
            </button>
          ))}
        </div>

        {/* ── Tab: Pedidos ── */}
        {activeTab === "pedidos" && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800">Pedidos del día</h2>
              <p className="text-warm-400 text-xs mt-0.5">Clic en el estado para avanzarlo</p>
            </div>
            {orders.length === 0 ? (
              <div className="py-16 text-center text-warm-400 text-sm">No hay pedidos para hoy.</div>
            ) : (
              <div className="divide-y divide-cream-100">
                {orders.map((order) => {
                  const canAdvance = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]) < STATUS_FLOW.length - 1;
                  return (
                    <div key={order.id} className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 hover:bg-cream-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-graphite-800 text-sm">{order.menuName}</p>
                          {order.segment && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEGMENT_COLORS[order.segment] ?? "bg-gray-100 text-gray-600"}`}>
                              {SEGMENT_LABELS[order.segment] ?? order.segment}
                            </span>
                          )}
                        </div>
                        <p className="text-warm-400 text-xs mt-0.5">
                          {order.userName ?? "Usuario"} · #{order.id.slice(-8).toUpperCase()}
                          {order.extras?.length > 0 && ` · +${order.extras.join(", ")}`}
                          {order.notes && ` · "${order.notes}"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-graphite-800 text-sm">${order.total.toLocaleString("es-AR")}</span>
                        <button onClick={() => advanceStatus(order.id, order.status)} disabled={!canAdvance || isPending}
                          title={canAdvance ? "Avanzar estado" : "Estado final"}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"} ${canAdvance ? "hover:ring-2 hover:ring-offset-1 hover:ring-terracotta-400 cursor-pointer" : "cursor-default opacity-80"}`}>
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

        {/* ── Tab: Reportes ── */}
        {activeTab === "reportes" && (
          <Reportes reports={reports} />
        )}

        {/* ── Tab: Menú del día ── */}
        {activeTab === "menudia" && (
          <MenuDelDia
            dailyMenus={dailyMenus}
            allMenus={menus}
            today={today}
            todayLabel={todayLabel}
            onUpdate={setDailyMenus}
          />
        )}

        {/* ── Tab: Catálogo ── */}
        {activeTab === "catalogo" && (
          <Catalogo menus={menus} onUpdate={setMenus} />
        )}

        {/* ── Tab: Ingredientes ── */}
        {activeTab === "ingredientes" && (
          <Ingredientes ingredients={ingredients} onUpdate={setIngredients} />
        )}

        {/* ── Tab: Precios por segmento ── */}
        {activeTab === "precios" && (
          <PreciosSegmento menus={menus} prices={prices} onUpdate={setPrices} />
        )}

        {/* ── Tab: Promociones ── */}
        {activeTab === "promociones" && (
          <Promociones promos={promos} onUpdate={setPromos} />
        )}

        {/* ── Tab: Redes Sociales ── */}
        {activeTab === "redes" && (
          <RedesSociales dailyMenus={dailyMenus} today={today} todayLabel={todayLabel} />
        )}

        {/* ── Tab: Empresas ── */}
        {activeTab === "empresas" && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800">Empresas registradas</h2>
            </div>
            {companies.length === 0 ? (
              <div className="py-16 text-center text-warm-400 text-sm">No hay empresas.</div>
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

// ═══════════════════════════════════════════════════════════════
// Sub-component: Reportes
// ═══════════════════════════════════════════════════════════════
const CATEGORY_LABELS: Record<string, string> = {
  almuerzo: "Almuerzos", entrada: "Entradas", postre: "Postres",
  bebida: "Bebidas", extra: "Extras", ensalada: "Ensaladas", especial: "Especiales",
};

function RankingRows({ rows, unit }: {
  rows: { label: string; qty: number; revenue: number }[];
  unit: string;
}) {
  const maxQty = Math.max(...rows.map((r) => r.qty), 1);
  return (
    <div className="divide-y divide-cream-100">
      {rows.map((r, i) => (
        <div key={r.label} className="px-6 py-3 hover:bg-cream-50 transition-colors">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-terracotta-500 text-white" : i < 3 ? "bg-terracotta-100 text-terracotta-700" : "bg-cream-200 text-warm-500"}`}>
                {i + 1}
              </span>
              <span className="font-medium text-graphite-800 text-sm truncate">{r.label}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 text-right">
              <span className="text-xs text-warm-400">{r.qty} {unit}</span>
              <span className="font-bold text-graphite-800 text-sm min-w-[80px]">${r.revenue.toLocaleString("es-AR")}</span>
            </div>
          </div>
          <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden ml-[34px]">
            <div className="h-full bg-terracotta-500 rounded-full transition-all" style={{ width: `${(r.qty / maxQty) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Reportes({ reports }: { reports: ReportsData }) {
  const totalQty     = reports.topDishes.reduce((s, d) => s + d.qty, 0);
  const totalRevenue = reports.byCategory.reduce((s, c) => s + c.revenue, 0);
  const totalOrders  = reports.byCategory.reduce((s, c) => s + c.qty, 0);
  const avgTicket    = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topDish      = reports.topDishes[0];

  // Ventas por día: completar los 14 días aunque no haya ventas
  const days: { date: string; qty: number; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    const found = reports.salesByDay.find((s) => s.date === iso);
    days.push({ date: iso, qty: found?.qty ?? 0, revenue: found?.revenue ?? 0 });
  }
  const maxDayRevenue = Math.max(...days.map((d) => d.revenue), 1);

  if (totalOrders === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 py-20 text-center">
        <TrendingUp size={40} className="text-warm-300 mx-auto mb-4" />
        <p className="text-warm-400 font-semibold">Todavía no hay ventas en los últimos 30 días.</p>
        <p className="text-warm-500 text-sm mt-1">Cuando entren pedidos, acá vas a ver rankings y tendencias.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs 30 días */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pedidos (30 días)", value: totalOrders.toLocaleString("es-AR") },
          { label: "Facturación (30 días)", value: `$${totalRevenue.toLocaleString("es-AR")}` },
          { label: "Ticket promedio", value: `$${Math.round(avgTicket).toLocaleString("es-AR")}` },
          { label: "Plato estrella", value: topDish?.name ?? "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-card border border-cream-200">
            <p className="text-xs text-warm-400 mb-1">{s.label}</p>
            <p className="font-bold text-graphite-800 text-lg leading-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ventas por día */}
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200">
          <h2 className="font-bold text-graphite-800">Ventas por día</h2>
          <p className="text-warm-400 text-xs mt-0.5">Facturación de los últimos 14 días</p>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-end gap-1.5 h-36">
            {days.map((d) => {
              const dayDate = new Date(d.date + "T12:00:00");
              const isToday = d === days[days.length - 1];
              const heightPct = (d.revenue / maxDayRevenue) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group relative">
                  <span className="absolute -top-1 -translate-y-full left-1/2 -translate-x-1/2 hidden group-hover:block bg-graphite-800 text-cream-100 text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-lg">
                    {dayDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · {d.qty} ped. · ${d.revenue.toLocaleString("es-AR")}
                  </span>
                  <div className="w-full h-28 flex items-end">
                    <div
                      className={`w-full rounded-t transition-all ${isToday ? "bg-terracotta-600" : d.revenue > 0 ? "bg-terracotta-400 group-hover:bg-terracotta-500" : "bg-cream-200"}`}
                      style={{ height: d.revenue > 0 ? `${Math.max(heightPct, 4)}%` : "3px" }}
                    />
                  </div>
                  <span className={`text-[10px] leading-none ${isToday ? "font-bold text-terracotta-600" : "text-warm-400"}`}>
                    {dayDate.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ranking de platos */}
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-graphite-800">Platos más vendidos</h2>
            <p className="text-warm-400 text-xs mt-0.5">Últimos 30 días · {totalQty} unidades</p>
          </div>
        </div>
        <RankingRows rows={reports.topDishes.map((d) => ({ label: d.name, qty: d.qty, revenue: d.revenue }))} unit="vend." />
      </div>

      {/* Categorías + Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-200">
            <h2 className="font-bold text-graphite-800">Por categoría</h2>
            <p className="text-warm-400 text-xs mt-0.5">Últimos 30 días</p>
          </div>
          <RankingRows rows={reports.byCategory.map((c) => ({ label: CATEGORY_LABELS[c.category] ?? c.category, qty: c.qty, revenue: c.revenue }))} unit="ped." />
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-200">
            <h2 className="font-bold text-graphite-800">Mejores clientes</h2>
            <p className="text-warm-400 text-xs mt-0.5">Últimos 30 días</p>
          </div>
          <RankingRows rows={reports.topClients.map((c) => ({ label: c.name, qty: c.qty, revenue: c.revenue }))} unit="ped." />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-component: Menú del día
// ═══════════════════════════════════════════════════════════════
function MenuDelDia({ dailyMenus, allMenus, today, todayLabel, onUpdate }: {
  dailyMenus: DailyMenuRow[];
  allMenus: MenuRow[];
  today: string;
  todayLabel: string;
  onUpdate: Dispatch<SetStateAction<DailyMenuRow[]>>;
}) {
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [stock, setStock] = useState("30");
  const [feedback, setFeedback] = useState<{ msg: string; err?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeIds = new Set(dailyMenus.map((dm) => dm.menus?.id).filter(Boolean));
  const available = allMenus.filter((m) => m.active && !activeIds.has(m.id));

  const handleAdd = () => {
    if (!selectedMenuId) return;
    setFeedback(null);
    startTransition(async () => {
      const r = await upsertDailyMenu(selectedMenuId, today, Number(stock));
      if (!r.success) { setFeedback({ msg: r.error ?? "Error", err: true }); return; }
      setFeedback({ msg: "Menú agregado al día." });
      setSelectedMenuId(""); setStock("30");
      // Refresh is done via revalidatePath on server — just optimistic update
      window.location.reload();
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      const r = await removeDailyMenu(id);
      if (r.success) onUpdate((prev) => prev.filter((dm) => dm.id !== id));
    });
  };

  return (
    <div className="space-y-4">
      {/* Current daily menus */}
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-graphite-800 capitalize">Menú de hoy — {todayLabel}</h2>
            <p className="text-warm-400 text-xs mt-0.5">{dailyMenus.length} platos disponibles</p>
          </div>
        </div>
        {dailyMenus.length === 0 ? (
          <div className="py-12 text-center text-warm-400 text-sm">No hay menú configurado para hoy.</div>
        ) : (
          <div className="divide-y divide-cream-100">
            {dailyMenus.map((dm) => {
              const remaining = dm.stock - dm.orders_count;
              const pct = Math.min((dm.orders_count / dm.stock) * 100, 100);
              return (
                <div key={dm.id} className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 hover:bg-cream-50">
                  <div className="flex-1">
                    <p className="font-medium text-graphite-800">{dm.menus?.name ?? "—"}</p>
                    <p className="text-xs text-warm-400 mt-0.5 capitalize">{dm.menus?.category} · ${dm.menus?.price.toLocaleString("es-AR")}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs text-warm-400">Pedidos</p>
                      <p className="font-bold text-graphite-800">{dm.orders_count}</p>
                    </div>
                    <div className="text-center min-w-[70px]">
                      <p className="text-xs text-warm-400">Stock</p>
                      <p className={`font-bold ${remaining <= 5 ? "text-red-600" : "text-graphite-800"}`}>{remaining}/{dm.stock}</p>
                    </div>
                    <div className="w-20">
                      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <button onClick={() => handleRemove(dm.id)} title="Quitar del menú del día"
                      className="text-warm-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add menu to day */}
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6">
        <h3 className="font-bold text-graphite-800 mb-4 flex items-center gap-2"><PlusCircle size={16} className="text-terracotta-500" />Agregar plato al menú de hoy</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <select value={selectedMenuId} onChange={(e) => setSelectedMenuId(e.target.value)}
            className="input-base flex-1">
            <option value="">— Seleccionar plato —</option>
            {available.map((m) => <option key={m.id} value={m.id}>{m.name} (${m.price.toLocaleString("es-AR")})</option>)}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-warm-400 whitespace-nowrap">Stock:</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min="1" max="500"
              className="input-base w-24" />
          </div>
          <button onClick={handleAdd} disabled={isPending || !selectedMenuId}
            className="px-5 py-2.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 transition-all text-sm">
            Agregar
          </button>
        </div>
        {feedback && <Feedback msg={feedback.msg} isError={feedback.err} />}
        {available.length === 0 && (
          <p className="text-xs text-warm-400 mt-3">Todos los platos activos ya están en el menú de hoy.</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-component: Catálogo de menús (CRUD)
// ═══════════════════════════════════════════════════════════════
const EMPTY_MENU = { name: "", description: "", category: "almuerzo", price: 0, calories: 0, protein: 0, carbs: 0, fat: 0, vitamins: "", tags: "", image_url: "", active: true };

function Catalogo({ menus, onUpdate }: { menus: MenuRow[]; onUpdate: Dispatch<SetStateAction<MenuRow[]>> }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_MENU);
  const [feedback, setFeedback] = useState<{ msg: string; err?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const openCreate = () => { setEditId(null); setForm(EMPTY_MENU); setFeedback(null); setShowForm(true); };
  const openEdit = (m: MenuRow) => {
    setEditId(m.id);
    setForm({
      name: m.name, description: m.description ?? "", category: m.category,
      price: m.price, calories: m.calories ?? 0,
      protein: m.protein ?? 0, carbs: m.carbs ?? 0, fat: m.fat ?? 0,
      vitamins: m.vitamins.join(", "), tags: m.tags.join(", "),
      image_url: m.image_url ?? "", active: m.active,
    });
    setFeedback(null); setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    setFeedback(null);
    startTransition(async () => {
      const r = await upsertMenu({
        id: editId ?? undefined,
        name: form.name, description: form.description, category: form.category,
        price: Number(form.price), calories: Number(form.calories) || undefined,
        protein: Number(form.protein) || undefined,
        carbs: Number(form.carbs) || undefined,
        fat: Number(form.fat) || undefined,
        vitamins: form.vitamins ? form.vitamins.split(",").map((v) => v.trim()).filter(Boolean) : [],
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        image_url: form.image_url || undefined, active: form.active,
      });
      if (!r.success) { setFeedback({ msg: r.error ?? "Error", err: true }); return; }
      setFeedback({ msg: editId ? "Menú actualizado." : "Menú creado." });
      setShowForm(false);
      window.location.reload();
    });
  };

  const handleDeactivate = (id: string) => {
    startTransition(async () => {
      await deleteMenu(id);
      onUpdate((prev) => prev.map((m) => m.id === id ? { ...m, active: false } : m));
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-bold text-graphite-800">Catálogo de platos ({menus.length})</h2>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-all">
            <PlusCircle size={15} /> Nuevo plato
          </button>
        </div>

        <div className="divide-y divide-cream-100">
          {menus.map((m) => (
            <div key={m.id} className="flex items-center gap-4 px-6 py-3 hover:bg-cream-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-graphite-800 text-sm">{m.name}</p>
                  <span className="text-xs bg-cream-200 text-graphite-600 px-2 py-0.5 rounded-full capitalize">{m.category}</span>
                  {!m.active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactivo</span>}
                </div>
                <p className="text-warm-400 text-xs mt-0.5">
                  ${m.price.toLocaleString("es-AR")} {m.calories ? `· ${m.calories} kcal` : ""}
                  {m.tags.length > 0 && ` · ${m.tags.join(", ")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(m)} className="p-1.5 text-warm-400 hover:text-terracotta-600 transition-colors"><Pencil size={14} /></button>
                {m.active && <button onClick={() => handleDeactivate(m.id)} className="p-1.5 text-warm-400 hover:text-red-500 transition-colors" title="Desactivar"><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-graphite-900/60">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h3 className="font-bold text-graphite-800">{editId ? "Editar plato" : "Nuevo plato"}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-warm-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label-xs">Nombre *</label>
                  <input className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Milanesa napolitana" />
                </div>
                <div>
                  <label className="label-xs">Categoría</label>
                  <select className="input-base" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-xs">Precio base *</label>
                  <input type="number" className="input-base" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="1500" />
                </div>
                <div>
                  <label className="label-xs">Calorías (kcal)</label>
                  <input type="number" className="input-base" value={form.calories || ""} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} placeholder="450" />
                </div>
                <div>
                  <label className="label-xs">Tags (separados por coma)</label>
                  <input className="input-base" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="vegano, sin gluten" />
                </div>
                {/* Macros */}
                <div className="col-span-2 pt-1">
                  <p className="label-xs mb-2 text-blue-600">Macronutrientes (g por porción)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="label-xs">Proteínas (g)</label>
                      <input type="number" className="input-base" value={form.protein || ""} onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })} placeholder="28" />
                    </div>
                    <div>
                      <label className="label-xs">Carbohidratos (g)</label>
                      <input type="number" className="input-base" value={form.carbs || ""} onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })} placeholder="45" />
                    </div>
                    <div>
                      <label className="label-xs">Grasas (g)</label>
                      <input type="number" className="input-base" value={form.fat || ""} onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })} placeholder="12" />
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="label-xs">Vitaminas y minerales destacados (separados por coma)</label>
                  <input className="input-base" value={form.vitamins} onChange={(e) => setForm({ ...form, vitamins: e.target.value })} placeholder="Vitamina C, Hierro, Calcio, Vitamina B12" />
                </div>
                <div className="col-span-2">
                  <label className="label-xs">Descripción</label>
                  <textarea className="input-base resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción breve del plato..." />
                </div>
                <div className="col-span-2">
                  <label className="label-xs">URL de imagen</label>
                  <input className="input-base" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="active-check" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-terracotta-500" />
                  <label htmlFor="active-check" className="text-sm text-graphite-700">Plato activo (visible en pedidos)</label>
                </div>
              </div>
              {feedback && <Feedback msg={feedback.msg} isError={feedback.err} />}
            </div>
            <div className="px-6 py-4 border-t border-cream-200 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-warm-500 hover:text-graphite-700">Cancelar</button>
              <button onClick={handleSave} disabled={isPending || !form.name || !form.price}
                className="px-6 py-2.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 text-sm transition-all">
                {isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-component: Ingredientes
// ═══════════════════════════════════════════════════════════════
const EMPTY_ING = { name: "", unit: "kg", stock_quantity: 0, cost_per_unit: 0, alert_threshold: 0 };

function Ingredientes({ ingredients, onUpdate }: { ingredients: IngredientRow[]; onUpdate: Dispatch<SetStateAction<IngredientRow[]>> }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_ING);
  const [feedback, setFeedback] = useState<{ msg: string; err?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const openCreate = () => { setEditId(null); setForm(EMPTY_ING); setFeedback(null); setShowForm(true); };
  const openEdit = (i: IngredientRow) => {
    setEditId(i.id);
    setForm({ name: i.name, unit: i.unit, stock_quantity: i.current_stock, cost_per_unit: i.cost_per_unit ?? 0, alert_threshold: i.min_stock_alert ?? 0 });
    setFeedback(null); setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    setFeedback(null);
    startTransition(async () => {
      const r = await upsertIngredient({
        id: editId ?? undefined, name: form.name, unit: form.unit,
        current_stock: Number(form.stock_quantity),
        cost_per_unit: Number(form.cost_per_unit) || undefined,
        min_stock_alert: Number(form.alert_threshold) || undefined,
      });
      if (!r.success) { setFeedback({ msg: r.error ?? "Error", err: true }); return; }
      setFeedback({ msg: editId ? "Ingrediente actualizado." : "Ingrediente creado." });
      setShowForm(false);
      window.location.reload();
    });
  };

  const handleAdjust = (id: string, delta: number) => {
    startTransition(async () => {
      const r = await adjustIngredientStock(id, delta);
      if (r.success) {
        onUpdate((prev) => prev.map((i) => i.id === id ? { ...i, current_stock: Math.max(0, i.current_stock + delta) } : i));
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-bold text-graphite-800">Inventario de ingredientes ({ingredients.length})</h2>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-all">
            <PlusCircle size={15} /> Nuevo
          </button>
        </div>
        {ingredients.length === 0 ? (
          <div className="py-12 text-center text-warm-400 text-sm">No hay ingredientes registrados.</div>
        ) : (
          <div className="divide-y divide-cream-100">
            {ingredients.map((ing) => {
              const isLow = ing.min_stock_alert != null && ing.current_stock <= ing.min_stock_alert;
              return (
                <div key={ing.id} className="flex items-center gap-4 px-6 py-3 hover:bg-cream-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-graphite-800 text-sm">{ing.name}</p>
                      {isLow && <span title="Stock bajo"><AlertTriangle size={13} className="text-amber-500" /></span>}
                    </div>
                    <p className="text-warm-400 text-xs mt-0.5">
                      {ing.cost_per_unit ? `$${ing.cost_per_unit.toLocaleString("es-AR")}/${ing.unit}` : `unidad: ${ing.unit}`}
                      {ing.min_stock_alert ? ` · alerta: ${ing.min_stock_alert}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleAdjust(ing.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-cream-200 hover:bg-cream-300 text-graphite-600 font-bold text-sm">−</button>
                    <span className={`font-bold text-sm min-w-[60px] text-center ${isLow ? "text-amber-600" : "text-graphite-800"}`}>
                      {ing.current_stock} {ing.unit}
                    </span>
                    <button onClick={() => handleAdjust(ing.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-cream-200 hover:bg-cream-300 text-graphite-600 font-bold text-sm">+</button>
                    <button onClick={() => openEdit(ing)} className="p-1.5 text-warm-400 hover:text-terracotta-600 transition-colors"><Pencil size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-graphite-900/60">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h3 className="font-bold text-graphite-800">{editId ? "Editar ingrediente" : "Nuevo ingrediente"}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-warm-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-xs">Nombre *</label>
                <input className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tomate" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">Unidad</label>
                  <select className="input-base" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    {["kg", "g", "l", "ml", "unidad", "docena"].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-xs">Stock actual</label>
                  <input type="number" className="input-base" value={form.stock_quantity || ""} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label-xs">Costo por unidad ($)</label>
                  <input type="number" className="input-base" value={form.cost_per_unit || ""} onChange={(e) => setForm({ ...form, cost_per_unit: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label-xs">Alerta de stock bajo</label>
                  <input type="number" className="input-base" value={form.alert_threshold || ""} onChange={(e) => setForm({ ...form, alert_threshold: Number(e.target.value) })} />
                </div>
              </div>
              {feedback && <Feedback msg={feedback.msg} isError={feedback.err} />}
            </div>
            <div className="px-6 py-4 border-t border-cream-200 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-warm-500">Cancelar</button>
              <button onClick={handleSave} disabled={isPending || !form.name}
                className="px-6 py-2.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 text-sm">
                {isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-component: Precios por segmento
// ═══════════════════════════════════════════════════════════════
function PreciosSegmento({ menus, prices, onUpdate }: {
  menus: MenuRow[];
  prices: SegmentPriceRow[];
  onUpdate: Dispatch<SetStateAction<SegmentPriceRow[]>>;
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<{ menuId: string; segment: string; val: string } | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const getPrice = (menuId: string, seg: string) =>
    prices.find((p) => p.menu_id === menuId && p.segment === seg)?.price;

  const startEdit = (menuId: string, segment: string) => {
    const cur = getPrice(menuId, segment) ?? menus.find((m) => m.id === menuId)?.price ?? 0;
    setEditing({ menuId, segment, val: String(cur) });
    setSaved(null);
  };

  const savePrice = () => {
    if (!editing) return;
    const price = Number(editing.val);
    if (!price) return;
    startTransition(async () => {
      const r = await setSegmentPrice(editing.menuId, editing.segment as "empresa" | "hogar" | "eventos", price);
      if (r.success) {
        onUpdate((prev) => {
          const existing = prev.find((p) => p.menu_id === editing.menuId && p.segment === editing.segment);
          if (existing) return prev.map((p) => p.menu_id === editing.menuId && p.segment === editing.segment ? { ...p, price } : p);
          return [...prev, { id: crypto.randomUUID(), menu_id: editing.menuId, segment: editing.segment, price, active: true }];
        });
        setSaved(`${editing.menuId}-${editing.segment}`);
        setEditing(null);
      }
    });
  };

  const activeMenus = menus.filter((m) => m.active);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-cream-200">
        <h2 className="font-bold text-graphite-800">Precios por segmento</h2>
        <p className="text-warm-400 text-xs mt-0.5">Clic en un precio para editarlo. Si no hay precio específico, se usa el precio base.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream-200 bg-cream-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-graphite-600 uppercase tracking-wider">Plato</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-graphite-600 uppercase tracking-wider">Base</th>
              {SEGMENTS.map((s) => (
                <th key={s} className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                  <span className={`px-2 py-0.5 rounded-full ${SEGMENT_COLORS[s]}`}>{SEGMENT_LABELS[s]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {activeMenus.map((m) => (
              <tr key={m.id} className="hover:bg-cream-50">
                <td className="px-6 py-3 font-medium text-graphite-800">{m.name}</td>
                <td className="px-4 py-3 text-center text-warm-500">${m.price.toLocaleString("es-AR")}</td>
                {SEGMENTS.map((seg) => {
                  const price = getPrice(m.id, seg);
                  const key = `${m.id}-${seg}`;
                  const isEditing = editing?.menuId === m.id && editing.segment === seg;
                  const justSaved = saved === key;
                  return (
                    <td key={seg} className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center gap-1 justify-center">
                          <span className="text-warm-400 text-xs">$</span>
                          <input type="number" value={editing.val} onChange={(e) => setEditing({ ...editing, val: e.target.value })}
                            className="w-20 border border-cream-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-terracotta-300"
                            autoFocus onKeyDown={(e) => { if (e.key === "Enter") savePrice(); if (e.key === "Escape") setEditing(null); }}
                          />
                          <button onClick={savePrice} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
                          <button onClick={() => setEditing(null)} className="text-warm-400 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(m.id, seg)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all hover:bg-cream-100 ${price ? "text-graphite-800" : "text-warm-300"} ${justSaved ? "ring-2 ring-green-400" : ""}`}>
                          {price ? `$${price.toLocaleString("es-AR")}` : "—"}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-component: Promociones
// ═══════════════════════════════════════════════════════════════
const EMPTY_PROMO = {
  name: "", discount_type: "percentage" as "percentage" | "fixed",
  discount_value: 10, min_order_total: "", applies_to: "all",
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  active: true,
};

function Promociones({ promos, onUpdate }: { promos: PromotionRow[]; onUpdate: Dispatch<SetStateAction<PromotionRow[]>> }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PROMO);
  const [feedback, setFeedback] = useState<{ msg: string; err?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!form.name || !form.discount_value) return;
    setFeedback(null);
    startTransition(async () => {
      const r = await upsertPromotion({
        name: form.name,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_total: form.min_order_total ? Number(form.min_order_total) : undefined,
        applies_to: form.applies_to as "all" | "empresa" | "hogar" | "eventos",
        valid_from: form.valid_from,
        valid_until: form.valid_until,
        active: form.active,
      });
      if (!r.success) { setFeedback({ msg: r.error ?? "Error", err: true }); return; }
      setFeedback({ msg: "Promoción guardada." });
      setShowForm(false);
      window.location.reload();
    });
  };

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      const r = await togglePromotion(id, !active);
      if (r.success) onUpdate((prev) => prev.map((p) => p.id === id ? { ...p, active: !active } : p));
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-bold text-graphite-800">Promociones ({promos.length})</h2>
          <button onClick={() => { setShowForm(true); setFeedback(null); setForm(EMPTY_PROMO); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-all">
            <PlusCircle size={15} /> Nueva
          </button>
        </div>
        {promos.length === 0 ? (
          <div className="py-12 text-center text-warm-400 text-sm">No hay promociones.</div>
        ) : (
          <div className="divide-y divide-cream-100">
            {promos.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-cream-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-graphite-800 text-sm">{p.name}</p>
                    <span className="px-2 py-0.5 bg-terracotta-50 text-terracotta-700 text-xs font-semibold rounded-full">
                      {p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `$${p.discount_value.toLocaleString("es-AR")} OFF`}
                    </span>
                    {p.applies_to !== "all" && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEGMENT_COLORS[p.applies_to] ?? "bg-gray-100 text-gray-600"}`}>
                        {SEGMENT_LABELS[p.applies_to] ?? p.applies_to}
                      </span>
                    )}
                  </div>
                  <p className="text-warm-400 text-xs mt-0.5">
                    {p.valid_from} → {p.valid_until}
                    {p.min_order_total ? ` · mín. $${p.min_order_total.toLocaleString("es-AR")}` : ""}
                  </p>
                </div>
                <button onClick={() => handleToggle(p.id, p.active)} disabled={isPending}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${p.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {p.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {p.active ? "Activa" : "Pausada"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-graphite-900/60">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h3 className="font-bold text-graphite-800">Nueva promoción</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-warm-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-xs">Nombre de la promoción *</label>
                <input className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Descuento de bienvenida" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">Tipo de descuento</label>
                  <select className="input-base" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })}>
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="label-xs">Valor *</label>
                  <input type="number" className="input-base" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label-xs">Aplica a</label>
                  <select className="input-base" value={form.applies_to} onChange={(e) => setForm({ ...form, applies_to: e.target.value })}>
                    <option value="all">Todos los segmentos</option>
                    <option value="empresa">Empresas</option>
                    <option value="hogar">Hogar</option>
                    <option value="eventos">Eventos</option>
                  </select>
                </div>
                <div>
                  <label className="label-xs">Pedido mínimo ($)</label>
                  <input type="number" className="input-base" value={form.min_order_total} onChange={(e) => setForm({ ...form, min_order_total: e.target.value })} placeholder="Opcional" />
                </div>
                <div>
                  <label className="label-xs">Válida desde</label>
                  <input type="date" className="input-base" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
                </div>
                <div>
                  <label className="label-xs">Válida hasta</label>
                  <input type="date" className="input-base" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="promo-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-terracotta-500" />
                <label htmlFor="promo-active" className="text-sm text-graphite-700">Activar inmediatamente</label>
              </div>
              {feedback && <Feedback msg={feedback.msg} isError={feedback.err} />}
            </div>
            <div className="px-6 py-4 border-t border-cream-200 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-warm-500">Cancelar</button>
              <button onClick={handleSave} disabled={isPending || !form.name}
                className="px-6 py-2.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 text-sm">
                {isPending ? "Guardando..." : "Crear promoción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-component: Redes Sociales / Instagram Card
// ═══════════════════════════════════════════════════════════════
function RedesSociales({ dailyMenus, today, todayLabel }: { dailyMenus: DailyMenuRow[]; today: string; todayLabel: string }) {
  const [caption, setCaption] = useState(() => buildCaption(dailyMenus, todayLabel));
  const [copied, setCopied] = useState(false);
  const [cardUrl] = useState(() => `/api/menu-card?date=${today}`);
  const imgRef = useRef<HTMLImageElement>(null);

  function buildCaption(menus: DailyMenuRow[], label: string) {
    const list = menus.map((dm) => `• ${dm.menus?.name ?? "—"}`).join("\n");
    return `🍽️ Menú del día — ${label}\n\n${list || "• Sin menú configurado"}\n\n📲 Pedidos hasta las 10:00 hs\n✉️ bengal.catering\n\n#Bengal #AlmuerzoCorporativo #CateringBA`;
  }

  const copyCaption = () => {
    navigator.clipboard.writeText(caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const downloadCard = async () => {
    const res = await fetch(cardUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bengal-menu-${today}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card preview */}
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6">
        <h2 className="font-bold text-graphite-800 mb-4 flex items-center gap-2"><Share2 size={18} className="text-pink-500" />Tarjeta para Instagram</h2>
        <div className="rounded-xl overflow-hidden border border-cream-200 mb-4 bg-cream-100 aspect-square flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} src={cardUrl} alt="Menú del día" className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div className="flex gap-3">
          <button onClick={downloadCard}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all text-sm">
            <Download size={15} /> Descargar imagen
          </button>
          <a href="https://www.instagram.com/bengaloficial/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-pink-400 text-pink-600 font-semibold rounded-xl hover:bg-pink-50 transition-all text-sm">
            <Share2 size={15} /> Ir a Instagram
          </a>
        </div>
        <p className="text-xs text-warm-400 mt-3 text-center">
          Descargá la imagen, luego pegá el caption en Instagram.
        </p>
      </div>

      {/* Caption editor */}
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6">
        <h2 className="font-bold text-graphite-800 mb-4">Caption / texto del post</h2>
        {dailyMenus.length === 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-700">
            <AlertTriangle size={14} /> Configurá el menú del día primero para ver los platos en el caption.
          </div>
        )}
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={12}
          className="input-base resize-none text-sm font-mono w-full mb-4" />
        <button onClick={copyCaption}
          className={`w-full flex items-center justify-center gap-2 py-2.5 font-semibold rounded-xl transition-all text-sm ${copied ? "bg-green-500 text-white" : "bg-graphite-800 text-cream-100 hover:bg-graphite-700"}`}>
          {copied ? <><Check size={15} /> ¡Caption copiado!</> : "Copiar caption al portapapeles"}
        </button>
        <p className="text-xs text-warm-400 mt-3">
          Podés editar el caption antes de copiarlo. Pegalo directamente en Instagram al publicar.
        </p>
      </div>
    </div>
  );
}
