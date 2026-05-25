import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = user
    ? await supabase
        .from("orders")
        .select(`
          id, date, status, extras, notes, total, created_at,
          menus ( id, name, category, price )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const safeOrders = orders ?? [];

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
            { label: "Gasto del mes", value: `$${monthTotal.toLocaleString("es-AR")}` },
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
                return (
                  <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-3 hover:bg-cream-50 transition-colors">
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
                      <span className="font-bold text-graphite-800 text-sm">${order.total.toLocaleString("es-AR")}</span>
                      <Link
                        href="/pedidos"
                        className="inline-flex items-center gap-1 text-xs text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors"
                      >
                        <RefreshCw size={11} /> Repetir
                      </Link>
                    </div>
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
