import Link from "next/link";
import { Users, ShoppingBag, TrendingUp, Settings } from "lucide-react";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  entregado:     "bg-green-100 text-green-700",
  en_camino:     "bg-blue-100 text-blue-700",
  en_produccion: "bg-purple-100 text-purple-700",
  pendiente:     "bg-gold-100 text-gold-700",
  cancelado:     "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  entregado: "Entregado", en_camino: "En camino",
  en_produccion: "En producción", pendiente: "Pendiente", cancelado: "Cancelado",
};

export default async function PanelEmpresaPage() {
  const session = await auth();
  const role      = session?.user?.role ?? "";
  const companyId = session?.user?.company_id ?? null;

  if (!companyId || !["company_admin", "admin"].includes(role)) redirect("/pedidos");

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const today = now.toISOString().split("T")[0];
  const monthStart = `${thisMonth}-01`;

  const [companyRows, teamRows, recentRows, monthRows, todayRows] = await Promise.all([
    sql`SELECT name, delivery_time, budget_per_person, contact_email FROM companies WHERE id = ${companyId} LIMIT 1`,
    sql`SELECT id, full_name, phone, role, created_at FROM profiles WHERE company_id = ${companyId} ORDER BY full_name`,
    sql`SELECT o.id, o.date::text AS date, o.status, o.total, o.user_id,
               m.name AS menu_name, p.full_name AS user_name
        FROM orders o
        JOIN menus m ON m.id = o.menu_id
        LEFT JOIN profiles p ON p.id = o.user_id
        WHERE o.company_id = ${companyId} ORDER BY o.created_at DESC LIMIT 5`,
    sql`SELECT total FROM orders WHERE company_id = ${companyId} AND date >= ${monthStart} AND status != 'cancelado'`,
    sql`SELECT id, status, user_id FROM orders WHERE company_id = ${companyId} AND date = ${today}`,
  ]);

  const company        = companyRows[0] ?? null;
  const teamMembers    = teamRows;
  const recentOrders   = recentRows;
  const todayTeamOrders = todayRows;

  const monthTotal = monthRows.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const budgetUsed = company?.budget_per_person
    ? Math.min((monthTotal / (Number(company.budget_per_person) * (teamMembers.length || 1) * 20)) * 100, 100)
    : null;

  const todayLabel = new Date(today + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="min-h-screen bg-cream-100 pt-16">
      <div className="container-xl py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-warm-400 uppercase tracking-wider">Panel empresa</span>
            <h1 className="text-3xl font-bold text-graphite-800 mt-0.5">{(company?.name as string) ?? "Mi empresa"}</h1>
          </div>
          <Link href="/contacto" className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors">
            <Settings size={15} /> Contactar soporte
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Miembros del equipo", value: teamMembers.length, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Pedidos este mes", value: monthRows.length, icon: ShoppingBag, color: "text-terracotta-600 bg-terracotta-50" },
            { label: "Gasto mensual", value: `$${Number(monthTotal).toLocaleString("es-AR")}`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
            { label: "Pedidos hoy", value: todayTeamOrders.length, icon: ShoppingBag, color: "text-gold-700 bg-gold-50" },
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

        {/* Presupuesto */}
        {budgetUsed !== null && (
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-graphite-800">Uso de presupuesto mensual</p>
              <span className="text-sm font-bold text-graphite-800">{Math.round(budgetUsed)}%</span>
            </div>
            <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${budgetUsed >= 90 ? "bg-red-500" : budgetUsed >= 70 ? "bg-gold-500" : "bg-green-500"}`}
                style={{ width: `${budgetUsed}%` }}
              />
            </div>
            <p className="text-xs text-warm-400 mt-2">
              ${Number(monthTotal).toLocaleString("es-AR")} de ${(Number(company?.budget_per_person ?? 0) * (teamMembers.length || 1) * 20).toLocaleString("es-AR")} estimados
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800">Equipo</h2>
            </div>
            {teamMembers.length === 0 ? (
              <div className="py-12 text-center text-warm-400 text-sm">No hay miembros registrados aún.</div>
            ) : (
              <div className="divide-y divide-cream-100">
                {teamMembers.map((member) => {
                  const memberId = member.id as string;
                  const hasOrderedToday = todayTeamOrders.some((o) => (o.user_id as string) === memberId);
                  return (
                    <div key={memberId} className="flex items-center justify-between px-6 py-3.5 hover:bg-cream-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 text-sm font-bold">
                          {((member.full_name as string | null) ?? "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-graphite-800 text-sm">{(member.full_name as string | null) ?? "Sin nombre"}</p>
                          <p className="text-warm-400 text-xs capitalize">{member.role === "company_admin" ? "Admin empresa" : "Empleado"}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        hasOrderedToday ? "bg-green-100 text-green-700" : "bg-cream-200 text-warm-500"
                      }`}>
                        {hasOrderedToday ? "Pidió hoy" : "Sin pedido"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Últimos pedidos */}
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800">Pedidos recientes</h2>
              <p className="text-warm-400 text-xs mt-0.5 capitalize">{todayLabel}</p>
            </div>
            <div className="divide-y divide-cream-100">
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center text-warm-400 text-sm">Sin pedidos aún.</div>
              ) : (
                recentOrders.map((o) => (
                  <div key={o.id as string} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-graphite-800 leading-tight">{(o.menu_name as string) ?? "—"}</p>
                        <p className="text-xs text-warm-400 mt-0.5">{(o.user_name as string | null) ?? "Usuario"}</p>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.status as string] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[o.status as string] ?? (o.status as string)}
                      </span>
                    </div>
                    <p className="text-xs text-warm-400 mt-1">${Number(o.total).toLocaleString("es-AR")}</p>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-4 border-t border-cream-100">
              <Link href="/historial" className="text-sm text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors">
                Ver historial completo →
              </Link>
            </div>
          </div>
        </div>

        {/* Config empresa */}
        <div className="mt-6 bg-white rounded-2xl shadow-card border border-cream-200 p-7">
          <h2 className="font-bold text-graphite-800 mb-5">Configuración</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Presupuesto por empleado/día", value: company?.budget_per_person ? `$${Number(company.budget_per_person).toLocaleString("es-AR")}` : "No configurado" },
              { label: "Horario de entrega", value: company?.delivery_time ? `${company.delivery_time as string} hs` : "No configurado" },
              { label: "Email de contacto", value: (company?.contact_email as string | null) ?? "No configurado" },
            ].map((c) => (
              <div key={c.label} className="p-4 bg-cream-50 rounded-xl border border-cream-200">
                <p className="text-xs text-warm-400 mb-1">{c.label}</p>
                <p className="font-bold text-graphite-800">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
