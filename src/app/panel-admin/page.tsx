"use client";

import { useState } from "react";
import { ShoppingBag, Users, TrendingUp, Package, Plus, ToggleLeft, ToggleRight, Download } from "lucide-react";
import { adminMenus, mockOrders, companyUsers } from "@/lib/data";

const stats = [
  { label: "Pedidos hoy", value: "122", icon: ShoppingBag, trend: "+12%", color: "text-terracotta-600 bg-terracotta-50" },
  { label: "Empresas activas", value: "83", icon: Users, trend: "+3", color: "text-blue-600 bg-blue-50" },
  { label: "Facturación mes", value: "$4.2M", icon: TrendingUp, trend: "+18%", color: "text-green-600 bg-green-50" },
  { label: "Degustaciones pend.", value: "7", icon: Package, trend: "nuevas", color: "text-gold-700 bg-gold-50" },
];

export default function PanelAdminPage() {
  const [activeTab, setActiveTab] = useState<"menus" | "pedidos" | "empresas">("menus");
  const [menuList, setMenuList] = useState(adminMenus);

  const toggleMenu = (id: number) =>
    setMenuList((prev) => prev.map((m) => m.id === id ? { ...m, active: !m.active } : m));

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
              <span className="px-3 py-1.5 bg-graphite-700 rounded-full border border-graphite-600 text-warm-300">
                Corte: 10:00 hs
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-card border border-cream-200">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <p className="text-xs text-warm-400 mb-0.5">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-graphite-800 text-xl">{s.value}</p>
                <span className="text-xs text-green-600 font-medium">{s.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-cream-200 rounded-xl mb-6 w-fit">
          {(["menus", "pedidos", "empresas"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab ? "bg-white text-graphite-800 shadow-sm" : "text-warm-500 hover:text-graphite-700"
              }`}
            >
              {tab === "menus" ? "Menús" : tab === "pedidos" ? "Pedidos" : "Empresas"}
            </button>
          ))}
        </div>

        {/* Tab: Menús */}
        {activeTab === "menus" && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-graphite-800">Menú del día — Lunes 22 de enero</h2>
                <p className="text-warm-400 text-xs mt-0.5">Total de pedidos: 122</p>
              </div>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-lg hover:bg-terracotta-600 transition-colors">
                <Plus size={14} /> Agregar plato
              </button>
            </div>
            <div className="divide-y divide-cream-100">
              {menuList.map((menu) => (
                <div key={menu.id} className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 hover:bg-cream-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-graphite-800">{menu.name}</p>
                      {!menu.active && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">Inactivo</span>
                      )}
                    </div>
                    <p className="text-xs text-warm-400 mt-0.5">{menu.date}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-warm-400">Pedidos</p>
                      <p className="font-bold text-graphite-800">{menu.orders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-warm-400">Stock</p>
                      <p className={`font-bold ${menu.orders >= menu.stock ? "text-red-600" : "text-graphite-800"}`}>
                        {menu.stock - menu.orders} / {menu.stock}
                      </p>
                    </div>
                    <div className="w-24">
                      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${menu.orders >= menu.stock * 0.9 ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${Math.min((menu.orders / menu.stock) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMenu(menu.id)}
                      className="text-warm-400 hover:text-terracotta-600 transition-colors"
                    >
                      {menu.active ? <ToggleRight size={24} className="text-terracotta-500" /> : <ToggleLeft size={24} />}
                    </button>
                    <button className="text-xs text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors">Editar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Pedidos */}
        {activeTab === "pedidos" && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
              <h2 className="font-bold text-graphite-800">Pedidos del día</h2>
              <button className="inline-flex items-center gap-1.5 text-sm text-graphite-600 font-medium border border-cream-300 px-3 py-1.5 rounded-lg hover:bg-cream-100 transition-colors">
                <Download size={14} /> Exportar producción
              </button>
            </div>
            <div className="divide-y divide-cream-100">
              {mockOrders.map((order) => (
                <div key={order.id} className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 hover:bg-cream-50">
                  <div className="flex-1">
                    <p className="font-medium text-graphite-800 text-sm">{order.menu}</p>
                    <p className="text-warm-400 text-xs mt-0.5">{order.id} · {order.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      order.status === "entregado" ? "bg-green-100 text-green-700" :
                      order.status === "en camino" ? "bg-blue-100 text-blue-700" :
                      "bg-gold-100 text-gold-700"
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-graphite-800 text-sm">${order.total.toLocaleString()}</span>
                    <button className="text-xs text-terracotta-600 font-semibold hover:text-terracotta-700">Ver detalle</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Empresas */}
        {activeTab === "empresas" && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
              <h2 className="font-bold text-graphite-800">Empresas registradas</h2>
              <button className="inline-flex items-center gap-1.5 text-sm text-white font-semibold bg-terracotta-500 px-3 py-1.5 rounded-lg hover:bg-terracotta-600 transition-colors">
                <Plus size={14} /> Nueva empresa
              </button>
            </div>
            <div className="divide-y divide-cream-100">
              {companyUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-cream-50 transition-colors">
                  <div className="w-9 h-9 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 font-bold text-sm">
                    {u.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-graphite-800 text-sm">{u.name}</p>
                    <p className="text-warm-400 text-xs">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-warm-400">{u.orders} pedidos</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {u.active ? "Activa" : "Inactiva"}
                    </span>
                    <button className="text-xs text-terracotta-600 font-semibold hover:text-terracotta-700">Ver</button>
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
