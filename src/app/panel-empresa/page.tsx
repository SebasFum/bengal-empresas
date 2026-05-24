import Link from "next/link";
import { Users, ShoppingBag, TrendingUp, Download, Settings, UserPlus } from "lucide-react";
import { companyUsers, mockOrders } from "@/lib/data";

const stats = [
  { label: "Usuarios activos", value: "4", icon: Users, color: "text-blue-600 bg-blue-50" },
  { label: "Pedidos este mes", value: "83", icon: ShoppingBag, color: "text-terracotta-600 bg-terracotta-50" },
  { label: "Gasto mensual", value: "$620.500", icon: TrendingUp, color: "text-green-600 bg-green-50" },
  { label: "Presupuesto disp.", value: "$79.500", icon: TrendingUp, color: "text-gold-700 bg-gold-50" },
];

export default function PanelEmpresaPage() {
  return (
    <div className="min-h-screen bg-cream-100 pt-16">
      <div className="container-xl py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-warm-400 uppercase tracking-wider">Panel empresa</span>
            <h1 className="text-3xl font-bold text-graphite-800 mt-0.5">TechCorp Argentina</h1>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-cream-300 text-graphite-600 rounded-xl text-sm font-medium hover:bg-cream-100 transition-colors shadow-card">
              <Download size={15} /> Exportar resumen
            </button>
            <Link href="/contacto" className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors">
              <Settings size={15} /> Configurar
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-card border border-cream-200">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <p className="text-xs text-warm-400 mb-0.5">{s.label}</p>
              <p className="font-bold text-graphite-800 text-xl">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usuarios */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
              <h2 className="font-bold text-graphite-800">Usuarios del equipo</h2>
              <button className="inline-flex items-center gap-1.5 text-sm text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors">
                <UserPlus size={14} /> Agregar
              </button>
            </div>
            <div className="divide-y divide-cream-100">
              {companyUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-cream-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 text-sm font-bold">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-graphite-800 text-sm">{user.name}</p>
                      <p className="text-warm-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-warm-400">{user.orders} pedidos</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      user.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                    <button className="text-xs text-warm-400 hover:text-terracotta-600 transition-colors">•••</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Últimos pedidos del equipo */}
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800">Pedidos del equipo</h2>
              <p className="text-warm-400 text-xs mt-0.5">Hoy, 18 de enero</p>
            </div>
            <div className="divide-y divide-cream-100">
              {mockOrders.slice(0, 4).map((o) => (
                <div key={o.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-graphite-800 leading-tight">{o.menu}</p>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      o.status === "entregado" ? "bg-green-100 text-green-700" :
                      o.status === "en camino" ? "bg-blue-100 text-blue-700" :
                      "bg-gold-100 text-gold-700"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-warm-400 mt-0.5">${o.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-cream-100">
              <Link href="/historial" className="text-sm text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors">
                Ver historial completo →
              </Link>
            </div>
          </div>
        </div>

        {/* Configuración de cuenta */}
        <div className="mt-6 bg-white rounded-2xl shadow-card border border-cream-200 p-7">
          <h2 className="font-bold text-graphite-800 mb-5">Configuración de la cuenta empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Presupuesto por empleado/día", value: "$8.500", action: "Editar" },
              { label: "Modalidad de facturación", value: "Mensual", action: "Cambiar" },
              { label: "Horario de entrega", value: "12:30 hs", action: "Modificar" },
            ].map((config) => (
              <div key={config.label} className="p-4 bg-cream-50 rounded-xl border border-cream-200">
                <p className="text-xs text-warm-400 mb-1">{config.label}</p>
                <p className="font-bold text-graphite-800 mb-3">{config.value}</p>
                <button className="text-xs text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors">
                  {config.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
