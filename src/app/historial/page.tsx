import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

const STATUS_STYLES: Record<string, string> = {
  entregado:     "bg-green-100 text-green-700",
  en_camino:     "bg-blue-100 text-blue-700",
  en_produccion: "bg-purple-100 text-purple-700",
  pendiente:     "bg-gold-100 text-gold-700",
  cancelado:     "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  entregado:     "Entregado",
  en_camino:     "En camino",
  en_produccion: "En producción",
  pendiente:     "Pendiente",
  cancelado:     "Cancelado",
};

const STATUS_FLOW = ["pendiente", "en_produccion", "en_camino", "entregado"] as const;
const STEP_LABELS = ["Recibido", "En cocina", "En camino", "Entregado"];

function OrderTimeline({ status }: { status: string }) {
  const idx = STATUS_FLOW.indexOf(status as typeof STATUS_FLOW[number]);
  if (idx < 0) return null; // cancelado u otro estado
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {STATUS_FLOW.map((step, i) => (
        <div key={step} className="flex-1 min-w-0">
          <div className={`h-1.5 rounded-full ${i <= idx ? "bg-terracotta-500" : "bg-cream-200"}`} />
          <p className={`text-[10px] mt-1 truncate ${i === idx ? "font-bold text-terracotta-600" : i < idx ? "text-warm-400" : "text-warm-300"}`}>
            {STEP_LABELS[i]}
          </p>
        </div>
      ))}
    </div>
  );
}

export default async function HistorialPage() {
  const session = await auth();
  const userId  = session?.user?.id;

  const rows = userId ? await sql`
    SELECT o.id, o.date::text AS date, o.status, o.extras, o.notes, o.total, o.created_at,
           m.id AS menu_id, m.name AS menu_name, m.category AS menu_category, m.price AS menu_price
    FROM orders o
    JOIN menus m ON m.id = o.menu_id
    WHERE o.user_id = ${userId}
    ORDER BY o.created_at DESC LIMIT 50
  ` : [];

  const safeOrders = rows.map((r) => ({
    id: r.id as string, date: r.date as string, status: r.status as string,
    extras: r.extras as string[], notes: r.notes as string | null,
    total: r.total as number, created_at: r.created_at as string,
    menus: { id: r.menu_id as string, name: r.menu_name as string },
  }));

  // Stats del mes actual
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthOrders = safeOrders.filter((o) => o.date.startsWith(thisMonth) && o.status !== "cancelado");
  const monthTotal = monthOrders.reduce((sum, o) => sum + o.total, 0);
  const avgPerOrder = monthOrders.length > 0 ? monthTotal / monthOrders.length : 0;

  // Plato más pedido
  const menuCounts: Record<string, { name: string; count: number }> = {};
  safeOrders.forEach((o) => {
    if (!o.menus) return;
    const m = o.menus as { id: string; name: string };
    menuCounts[m.id] = menuCounts[m.id]
      ? { ...menuCounts[m.id], count: menuCounts[m.id].count + 1 }
      : { name: m.name, count: 1 };
  });
  const favorite = Object.values(menuCounts).sort((a, b) => b.count - a.count)[0];

  return (
    <div className="min-h-screen bg-cream-100 pt-16">
      <div className="container-xl py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-graphite-800">Mi historial</h1>
            <p className="text-warm-400 mt-1 text-sm">Todos tus pedidos, en un lugar.</p>
          </div>
        </div>

        {/* Stats del mes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pedidos este mes", value: monthOrders.length.toString() },
            { label: "Gasto del mes", value: `$${Number(monthTotal).toLocaleString("es-AR")}` },
            { label: "Plato favorito", value: favorite?.name ?? "—" },
            { label: "Promedio por pedido", value: avgPerOrder > 0 ? `$${Math.round(avgPerOrder).toLocaleString("es-AR")}` : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-card border border-cream-200">
              <p className="text-xs text-warm-400 mb-1">{s.label}</p>
              <p className="font-bold text-graphite-800 text-lg leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <h2 className="font-bold text-graphite-800">Pedidos recientes</h2>
            <span className="text-xs text-warm-400">{safeOrders.length} pedidos</span>
          </div>

          {safeOrders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-warm-400 text-sm">Todavía no tenés pedidos.</p>
              <Link href="/pedidos" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors">
                Hacer tu primer pedido
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-cream-200">
              {safeOrders.map((order) => {
                const menu = order.menus as { id: string; name: string } | null;
                const dateLabel = new Date(order.date + "T12:00:00").toLocaleDateString("es-AR", {
                  weekday: "short", day: "numeric", month: "short",
                });
                const isActive = ["pendiente", "en_produccion", "en_camino"].includes(order.status);
                return (
                  <div key={order.id} className="px-6 py-4 hover:bg-cream-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-terracotta-50 rounded-xl flex items-center justify-center text-terracotta-600 text-xs font-bold flex-shrink-0">
                          {order.id.slice(-4).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-graphite-800 text-sm">{menu?.name ?? "Menú"}</p>
                          <p className="text-warm-400 text-xs capitalize">{dateLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                        <span className="font-bold text-graphite-800 text-sm">${Number(order.total).toLocaleString("es-AR")}</span>
                        <Link
                          href="/pedidos"
                          className="inline-flex items-center gap-1 text-xs text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors"
                        >
                          <RefreshCw size={11} /> Repetir
                        </Link>
                      </div>
                    </div>
                    {isActive && (
                      <div className="md:pl-14 max-w-md">
                        <OrderTimeline status={order.status} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/pedidos" className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all text-sm">
            Hacer nuevo pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
