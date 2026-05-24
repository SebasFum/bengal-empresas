import Link from "next/link";
import { RefreshCw, Download } from "lucide-react";
import { mockOrders } from "@/lib/data";

const statusColors: Record<string, string> = {
  entregado: "bg-green-100 text-green-700",
  "en camino": "bg-blue-100 text-blue-700",
  pendiente: "bg-gold-100 text-gold-700",
  cancelado: "bg-red-100 text-red-700",
};

export default function HistorialPage() {
  return (
    <div className="min-h-screen bg-cream-100 pt-16">
      <div className="container-xl py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-graphite-800">Mi historial</h1>
            <p className="text-warm-400 mt-1 text-sm">Todos tus pedidos, en un lugar.</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-cream-300 text-graphite-600 rounded-xl text-sm font-medium hover:bg-cream-100 transition-colors shadow-card">
            <Download size={15} />
            Descargar resumen
          </button>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pedidos este mes", value: "18" },
            { label: "Gasto del mes", value: "$132.400" },
            { label: "Plato favorito", value: "Lomo al Champignon" },
            { label: "Promedio por pedido", value: "$7.355" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-card border border-cream-200">
              <p className="text-xs text-warm-400 mb-1">{s.label}</p>
              <p className="font-bold text-graphite-800 text-lg">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabla de pedidos */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <h2 className="font-bold text-graphite-800">Pedidos recientes</h2>
            <span className="text-xs text-warm-400">{mockOrders.length} pedidos</span>
          </div>

          <div className="divide-y divide-cream-200">
            {mockOrders.map((order) => (
              <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-3 hover:bg-cream-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-terracotta-50 rounded-xl flex items-center justify-center text-terracotta-600 text-xs font-bold">
                    {order.id.split("-")[1]}
                  </div>
                  <div>
                    <p className="font-semibold text-graphite-800 text-sm">{order.menu}</p>
                    <p className="text-warm-400 text-xs">{order.date} · {order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-graphite-800 text-sm">${order.total.toLocaleString()}</span>
                  <Link
                    href="/pedidos"
                    className="inline-flex items-center gap-1 text-xs text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors"
                  >
                    <RefreshCw size={11} /> Repetir
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
