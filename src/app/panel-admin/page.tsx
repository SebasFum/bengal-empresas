import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PanelAdminClient, {
  type TodayOrder, type DailyMenuRow, type CompanyRow,
  type MenuRow, type IngredientRow, type SegmentPriceRow, type PromotionRow,
} from "./PanelAdminClient";

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
    { data: rawMenus },
    { data: rawIngredients },
    { data: rawSegmentPrices },
    { data: rawPromotions },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("date", today).neq("status", "cancelado"),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("orders").select("total").eq("date", today).neq("status", "cancelado"),
    supabase.from("daily_menus")
      .select("id, date, stock, orders_count, menus ( id, name, category, price, active )")
      .eq("date", today),
    supabase.from("orders")
      .select("id, date, status, total, extras, notes, created_at, segment, user_id, menus ( name )")
      .eq("date", today)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("companies")
      .select("id, name, contact_email, active, delivery_time, budget_per_person")
      .order("name"),
    supabase.from("menus")
      .select("id, name, description, category, price, calories, protein, carbs, fat, vitamins, tags, image_url, active")
      .order("name"),
    supabase.from("ingredients")
      .select("id, name, unit, current_stock, cost_per_unit, min_stock_alert")
      .order("name"),
    supabase.from("menu_segment_prices")
      .select("id, menu_id, segment, price, active"),
    supabase.from("promotions")
      .select("id, name, discount_type, discount_value, min_order_total, applies_to, valid_from, valid_until, active")
      .order("created_at", { ascending: false }),
  ]);

  // Enrich orders with profile names
  const userIds = [...new Set((rawTodayOrders ?? []).map((o) => o.user_id))];
  const { data: profileNames } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };
  const nameMap = Object.fromEntries((profileNames ?? []).map((p) => [p.id, p.full_name ?? "Cliente"]));

  const todayOrders: TodayOrder[] = (rawTodayOrders ?? []).map((o) => ({
    id: o.id,
    date: o.date,
    status: o.status,
    total: o.total,
    extras: o.extras,
    notes: o.notes,
    created_at: o.created_at,
    segment: o.segment ?? null,
    menuName: (o.menus as { name: string } | null)?.name ?? "—",
    userName: nameMap[o.user_id] ?? "Cliente",
  }));

  const revenueToday = (todayRevenue ?? []).reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <PanelAdminClient
      stats={{ todayOrders: todayOrdersCount ?? 0, activeCompanies: companiesCount ?? 0, revenueToday }}
      dailyMenus={(rawDailyMenus ?? []) as unknown as DailyMenuRow[]}
      todayOrders={todayOrders}
      companies={(rawCompanies ?? []) as CompanyRow[]}
      menus={(rawMenus ?? []) as MenuRow[]}
      ingredients={(rawIngredients ?? []) as unknown as IngredientRow[]}
      segmentPrices={(rawSegmentPrices ?? []) as SegmentPriceRow[]}
      promotions={(rawPromotions ?? []) as PromotionRow[]}
      today={today}
    />
  );
}
