import { createClient } from "@/lib/supabase/server";
import { menuCategories } from "@/lib/data";
import PedidosClient from "./PedidosClient";
import type { Segment } from "@/lib/supabase/types";

export type MenuItem = {
  dailyMenuId: string | null;
  stock: number;
  ordersCount: number;
  id: string;
  name: string;
  description: string | null;
  category: string;
  basePrice: number;
  segmentPrice: number;   // precio efectivo para este usuario
  calories: number | null;
  tags: string[];
  image_url: string | null;
};

const SEGMENT_LABELS: Record<string, string> = {
  empresa: "Empresas", hogar: "Hogar", eventos: "Eventos",
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Obtener usuario y su segmento
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, role, company_id, dietary_restrictions").eq("id", user.id).single()
    : { data: null };

  const userSegment: Segment = (["empresa", "hogar", "eventos"].includes(profile?.role ?? "")
    ? profile!.role
    : "empresa") as Segment;

  // Intentar obtener menú del día
  const { data: dailyMenus } = await supabase
    .from("daily_menus")
    .select("id, date, stock, orders_count, menus ( id, name, description, category, price, calories, tags, image_url )")
    .eq("date", today)
    .gt("stock", 0);

  // Obtener precios por segmento
  const menuIds = (dailyMenus ?? [])
    .map((dm) => (dm.menus as { id: string } | null)?.id)
    .filter(Boolean) as string[];

  const { data: segmentPrices } = menuIds.length > 0
    ? await supabase
        .from("menu_segment_prices")
        .select("menu_id, price")
        .eq("segment", userSegment)
        .in("menu_id", menuIds)
        .eq("active", true)
    : { data: [] };

  const priceMap = Object.fromEntries((segmentPrices ?? []).map((sp) => [sp.menu_id, sp.price]));

  let menuItems: MenuItem[] = [];

  if (dailyMenus && dailyMenus.length > 0) {
    menuItems = dailyMenus
      .filter((dm) => dm.menus)
      .map((dm) => {
        const m = dm.menus as {
          id: string; name: string; description: string | null;
          category: string; price: number; calories: number | null;
          tags: string[]; image_url: string | null;
        };
        return {
          dailyMenuId: dm.id, stock: dm.stock, ordersCount: dm.orders_count,
          id: m.id, name: m.name, description: m.description,
          category: m.category, basePrice: m.price,
          segmentPrice: priceMap[m.id] ?? m.price,
          calories: m.calories, tags: m.tags, image_url: m.image_url,
        };
      });
  } else {
    // Fallback: todos los menús activos
    const { data: allMenus } = await supabase
      .from("menus").select("id, name, description, category, price, calories, tags, image_url").eq("active", true);

    const allIds = (allMenus ?? []).map((m) => m.id);
    const { data: fallbackPrices } = allIds.length > 0
      ? await supabase.from("menu_segment_prices").select("menu_id, price").eq("segment", userSegment).in("menu_id", allIds).eq("active", true)
      : { data: [] };
    const fallbackMap = Object.fromEntries((fallbackPrices ?? []).map((sp) => [sp.menu_id, sp.price]));

    menuItems = (allMenus ?? []).map((m) => ({
      dailyMenuId: null, stock: 50, ordersCount: 0,
      id: m.id, name: m.name, description: m.description,
      category: m.category, basePrice: m.price,
      segmentPrice: fallbackMap[m.id] ?? m.price,
      calories: m.calories, tags: m.tags, image_url: m.image_url,
    }));
  }

  // Promociones activas para este segmento
  const { data: promos } = await supabase
    .from("promotions")
    .select("id, name, discount_type, discount_value, min_order_total")
    .eq("active", true)
    .or(`applies_to.eq.all,applies_to.eq.${userSegment}`)
    .lte("valid_from", today)
    .gte("valid_until", today);

  const userInitial = (profile?.full_name ?? user?.email ?? "U")[0].toUpperCase();
  const todayLabel = new Date(today + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <PedidosClient
      menuItems={menuItems}
      categories={menuCategories}
      today={today}
      todayLabel={todayLabel}
      userInitial={userInitial}
      userSegment={userSegment}
      segmentLabel={SEGMENT_LABELS[userSegment] ?? ""}
      promotions={(promos ?? []).map((p) => ({
        id: p.id, name: p.name,
        discountType: p.discount_type as "percentage" | "fixed",
        discountValue: p.discount_value,
        minOrderTotal: p.min_order_total,
      }))}
    />
  );
}
