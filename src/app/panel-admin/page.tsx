import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PanelAdminClient, { type TodayOrder, type DailyMenuRow, type CompanyRow } from "./PanelAdminClient";

export default async function PanelAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (profile?.role !== "admin") redirect("/pedidos");

  const today = new Date().toISOString().split("T")[0];

  const [
    { count: todayOrdersCount },
    { count: companiesCount },
    { data: todayRevenue },
    { data: rawDailyMenus },
    { data: rawTodayOrders },
    { data: rawCompanies },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("date", today).neq("status", "cancelado"),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("orders").select("total").eq("date", today).neq("status", "cancelado"),
    supabase.from("daily_menus").select("id, date, stock, orders_count, menus ( id, name, category, price, active )").eq("date", today),
    supabase.from("orders").select("id, date, status, total, extras, notes, created_at, menus ( name )").eq("date", today).order("created_at", { ascending: false }).limit(100),
    supabase.from("companies").select("id, name, contact_email, active, delivery_time, budget_per_person").order("name"),
  ]);

  // Enrich orders with profile full_name in a separate query to avoid FK type issues
  const orderIds = (rawTodayOrders ?? []).map((o) => o.id);
  const { data: orderProfiles } = orderIds.length > 0
    ? await supabase.from("orders").select("id, user_id").in("id", orderIds)
    : { data: [] };
  const userIds = [...new Set((orderProfiles ?? []).map((o) => o.user_id))];
  const { data: profileNames } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profileNames ?? []).map((p) => [p.id, p.full_name]));
  const userIdMap = Object.fromEntries((orderProfiles ?? []).map((o) => [o.id, o.user_id]));

  const todayOrders: TodayOrder[] = (rawTodayOrders ?? []).map((o) => ({
    id: o.id,
    date: o.date,
    status: o.status,
    total: o.total,
    extras: o.extras,
    notes: o.notes,
    created_at: o.created_at,
    menuName: (o.menus as { name: string } | null)?.name ?? "—",
    userName: profileMap[userIdMap[o.id] ?? ""] ?? null,
  }));

  const revenueToday = (todayRevenue ?? []).reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <PanelAdminClient
      stats={{
        todayOrders: todayOrdersCount ?? 0,
        activeCompanies: companiesCount ?? 0,
        revenueToday,
      }}
      dailyMenus={(rawDailyMenus ?? []) as unknown as DailyMenuRow[]}
      todayOrders={todayOrders}
      companies={(rawCompanies ?? []) as CompanyRow[]}
      today={today}
    />
  );
}
