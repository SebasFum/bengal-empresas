import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import PanelAdminClient, {
  type TodayOrder, type DailyMenuRow, type CompanyRow,
  type MenuRow, type IngredientRow, type SegmentPriceRow, type PromotionRow,
  type ReportsData,
} from "./PanelAdminClient";

export default async function PanelAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/pedidos");

  const today = new Date().toISOString().split("T")[0];

  const [
    ordersCountRows, companiesCountRows, revenueRows,
    rawDailyMenus, rawTodayOrders, rawCompanies,
    rawMenus, rawIngredients, rawSegmentPrices, rawPromotions,
  ] = await Promise.all([
    sql`SELECT COUNT(*) AS cnt FROM orders WHERE date = ${today} AND status != 'cancelado'`,
    sql`SELECT COUNT(*) AS cnt FROM companies WHERE active = true`,
    sql`SELECT total FROM orders WHERE date = ${today} AND status != 'cancelado'`,
    sql`SELECT dm.id, dm.date::text AS date, dm.stock, dm.orders_count,
               m.id AS menu_id, m.name AS menu_name, m.category AS menu_category, m.price AS menu_price, m.active AS menu_active
        FROM daily_menus dm JOIN menus m ON m.id = dm.menu_id WHERE dm.date = ${today}`,
    sql`SELECT o.id, o.date::text AS date, o.status, o.total, o.extras, o.notes,
               o.created_at, o.segment, o.user_id, m.name AS menu_name
        FROM orders o JOIN menus m ON m.id = o.menu_id
        WHERE o.date = ${today} ORDER BY o.created_at DESC LIMIT 100`,
    sql`SELECT id, name, contact_email, active, delivery_time, budget_per_person FROM companies ORDER BY name`,
    sql`SELECT id, name, description, category, price, calories, protein, carbs, fat, vitamins, tags, image_url, active FROM menus ORDER BY name`,
    sql`SELECT id, name, unit, current_stock, cost_per_unit, min_stock_alert FROM ingredients ORDER BY name`,
    sql`SELECT id, menu_id, segment, price, active FROM menu_segment_prices`,
    sql`SELECT id, name, discount_type, discount_value, min_order_total, applies_to, valid_from::text AS valid_from, valid_until::text AS valid_until, active FROM promotions ORDER BY id DESC`,
  ]);

  // ─── Reportes (últimos 30 / 14 días) ──────────────────────
  const [topDishes, salesByDay, byCategory, topClients] = await Promise.all([
    sql`SELECT m.name, COUNT(*)::int AS qty, COALESCE(SUM(o.total), 0) AS revenue
        FROM orders o JOIN menus m ON m.id = o.menu_id
        WHERE o.status != 'cancelado' AND o.date >= CURRENT_DATE - 29
        GROUP BY m.name ORDER BY qty DESC, revenue DESC LIMIT 10`,
    sql`SELECT o.date::text AS date, COUNT(*)::int AS qty, COALESCE(SUM(o.total), 0) AS revenue
        FROM orders o
        WHERE o.status != 'cancelado' AND o.date >= CURRENT_DATE - 13
        GROUP BY o.date ORDER BY o.date`,
    sql`SELECT m.category, COUNT(*)::int AS qty, COALESCE(SUM(o.total), 0) AS revenue
        FROM orders o JOIN menus m ON m.id = o.menu_id
        WHERE o.status != 'cancelado' AND o.date >= CURRENT_DATE - 29
        GROUP BY m.category ORDER BY revenue DESC`,
    sql`SELECT COALESCE(p.full_name, u.email) AS name, COUNT(*)::int AS qty, COALESCE(SUM(o.total), 0) AS revenue
        FROM orders o
        JOIN users u ON u.id = o.user_id
        LEFT JOIN profiles p ON p.id = o.user_id
        WHERE o.status != 'cancelado' AND o.date >= CURRENT_DATE - 29
        GROUP BY COALESCE(p.full_name, u.email) ORDER BY revenue DESC LIMIT 8`,
  ]);

  const reports: ReportsData = {
    topDishes: topDishes.map((r) => ({ name: r.name as string, qty: Number(r.qty), revenue: Number(r.revenue) })),
    salesByDay: salesByDay.map((r) => ({ date: r.date as string, qty: Number(r.qty), revenue: Number(r.revenue) })),
    byCategory: byCategory.map((r) => ({ category: r.category as string, qty: Number(r.qty), revenue: Number(r.revenue) })),
    topClients: topClients.map((r) => ({ name: r.name as string, qty: Number(r.qty), revenue: Number(r.revenue) })),
  };

  const nameMap = Object.fromEntries(rawTodayOrders.map((o) => [o.user_id as string, ""]));
  if (Object.keys(nameMap).length > 0) {
    const profileRows = await sql`SELECT id, full_name FROM profiles WHERE id = ANY(${Object.keys(nameMap)})`;
    profileRows.forEach((p) => { nameMap[p.id as string] = (p.full_name as string) ?? "Cliente"; });
  }

  const todayOrders: TodayOrder[] = rawTodayOrders.map((o) => ({
    id: o.id as string, date: o.date as string, status: o.status as string,
    total: o.total as number, extras: o.extras as string[], notes: o.notes as string | null,
    created_at: o.created_at as string, segment: (o.segment as string | null) ?? null,
    menuName: (o.menu_name as string) ?? "—", userName: nameMap[o.user_id as string] ?? "Cliente",
  }));

  const dailyMenus = rawDailyMenus.map((r) => ({
    id: r.id as string, date: r.date as string, stock: r.stock as number, orders_count: r.orders_count as number,
    menus: { id: r.menu_id as string, name: r.menu_name as string, category: r.menu_category as string, price: r.menu_price as number, active: r.menu_active as boolean },
  }));

  const revenueToday = revenueRows.reduce((s, o) => s + Number(o.total ?? 0), 0);

  return (
    <PanelAdminClient
      stats={{ todayOrders: Number(ordersCountRows[0]?.cnt ?? 0), activeCompanies: Number(companiesCountRows[0]?.cnt ?? 0), revenueToday }}
      dailyMenus={dailyMenus as unknown as DailyMenuRow[]}
      todayOrders={todayOrders}
      companies={rawCompanies as unknown as CompanyRow[]}
      menus={rawMenus as unknown as MenuRow[]}
      ingredients={rawIngredients as unknown as IngredientRow[]}
      segmentPrices={rawSegmentPrices as unknown as SegmentPriceRow[]}
      promotions={rawPromotions as unknown as PromotionRow[]}
      reports={reports}
      today={today}
    />
  );
}
