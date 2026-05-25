import Link from "next/link";
import { Users, ShoppingBag, TrendingUp, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role, company_id").eq("id", user.id).single()
    : { data: null };

  if (!profile?.company_id || !["company_admin", "admin"].includes(profile.role ?? "")) {
    redirect("/pedidos");
  }

  const companyId = profile.company_id;
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const today = now.toISOString().split("T")[0];

  const [
    { data: company },
    { data: teamMembers },
    { data: recentOrders },
    { data: monthOrders },
  ] = await Promise.all([
    supabase.from("companies").select("name, delivery_time, budget_per_person, contact_email").eq("id", companyId).single(),
    supabase.from("profiles").select("id, full_name, phone, role, created_at").eq("company_id", companyId),
    supabase.from("orders").select("id, date, status, total, user_id, menus ( name )").eq("company_id", companyId).order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("total, status").eq("company_id", companyId).gte("date", `${thisMonth}-01`).neq("status", "cancelado"),
  ]);

  // Fetch names for recent orders separately
  const recentUserIds = [...new Set((recentOrders ?? []).map((o) => o.user_id))];
  const { data: recentProfileNames } = recentUserIds.length > 0
    ? await supabase.from("profiles").select("id, full_name").in("id", recentUserIds)
    : { data: [] };
  const recentProfileMap = Object.fromEntries((recentProfileNames ?? []).map((p) => [p.id, p.full_name]));

  // Pedidos de hoy del equipo
  const { data: todayTeamOrders } = await supabase
    .from("orders")
    .select("id, status, user_id")
    .eq("company_id", companyId)
    .eq("date", today);

  const monthTotal = (monthOrders ?? []).reduce((s, o) => s + o.total, 0);
  const budgetUsed = company?.budget_per_person
    ? Math.min((monthTotal / (company.budget_per_person * (teamMembers?.length ?? 1) * 20)) * 100, 100)
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
            <h1 className="text-3xl font-bold text-graphite-800 mt-0.5">{company?.name ?? "Mi empresa"}</h1>
          </div>
          <Link href="/contacto" className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white text-sm font-semibold rounded-xl hover:bg-terracotta-600 transition-colors">
            <Settings size={15} /> Contactar soporte
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Miembros del equipo", value: teamMembers?.length ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Pedidos este mes", value: monthOrders?.length ?? 0, icon: ShoppingBag, color: "text-terracotta-600 bg-terracotta-50" },
            { label: "Gasto mensual", value: `$${monthTotal.toLocaleString("es-AR")}`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
            {
              label: "Pedidos hoy",
              value: todayTeamOrders?.length ?? 0,
              icon: ShoppingBag,
              color: "text-gold-700 bg-gold-50",
            },
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
              ${monthTotal.toLocaleString("es-AR")} de ${((company?.budget_per_person ?? 0) * (teamMembers?.length ?? 1) * 20).toLocaleString("es-AR")} estimados
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200">
              <h2 className="font-bold text-graphite-800">Equipo</h2>
            </div>
            {(teamMembers ?? []).length === 0 ? (
              <div className="py-12 text-center text-warm-400 text-sm">No hay miembros registrados aún.</div>
            ) : (
              <div className="divide-y divide-cream-100">
                {(teamMembers ?? []).map((member) => {
                  const hasOrderedToday = todayTeamOrders?.some((o) => o.user_id === member.id);
                  return (
                    <div key={member.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-cream-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 text-sm font-bold">
                          {(member.full_name ?? "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-graphite-800 text-sm">{member.full_name ?? "Sin nombre"}</p>
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
              {(recentOrders ?? []).length === 0 ? (
                <div className="py-8 text-center text-warm-400 text-sm">Sin pedidos aún.</div>
              ) : (
                (recentOrders ?? []).map((o) => {
                  const menu = o.menus as { name: string } | null;
                  const personName = recentProfileMap[o.user_id] ?? "Usuario";
                  return (
                    <div key={o.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-graphite-800 leading-tight">{menu?.name ?? "—"}</p>
                          <p className="text-xs text-warm-400 mt-0.5">{personName}</p>
                        </div>
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </div>
                      <p className="text-xs text-warm-400 mt-1">${o.total.toLocaleString("es-AR")}</p>
                    </div>
                  );
                })
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
              { label: "Presupuesto por empleado/día", value: company?.budget_per_person ? `$${company.budget_per_person.toLocaleString("es-AR")}` : "No configurado" },
              { label: "Horario de entrega", value: company?.delivery_time ? `${company.delivery_time} hs` : "No configurado" },
              { label: "Email de contacto", value: company?.contact_email ?? "No configurado" },
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
