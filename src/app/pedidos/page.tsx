import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
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
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  vitamins: string[];
  tags: string[];
  image_url: string | null;
};

const SEGMENT_LABELS: Record<string, string> = {
  empresa: "Empresas", hogar: "Hogar", eventos: "Eventos",
};

export default async function PedidosPage() {
  const session = await auth();
  const today   = new Date().toISOString().split("T")[0];

  const profileRows = session?.user
    ? await sql`SELECT full_name, role, company_id FROM profiles WHERE id = ${session.user.id} LIMIT 1`
    : [];
  const profile = profileRows[0] ?? null;

  const userSegment: Segment = (["empresa", "hogar", "eventos"].includes((profile?.role as string) ?? "")
    ? (profile!.role as Segment)
    : "empresa");

  // Menú del día + precios por segmento
  const dailyRows = await sql`
    SELECT dm.id AS daily_id, dm.stock, dm.orders_count,
           m.id, m.name, m.description, m.category, m.price, m.calories,
           m.protein, m.carbs, m.fat, m.vitamins, m.tags, m.image_url,
           sp.price AS segment_price
    FROM daily_menus dm
    JOIN menus m ON m.id = dm.menu_id
    LEFT JOIN menu_segment_prices sp ON sp.menu_id = m.id AND sp.segment = ${userSegment} AND sp.active = true
    WHERE dm.date = ${today} AND dm.stock > 0
  `;

  let menuItems: MenuItem[] = [];

  if (dailyRows.length > 0) {
    menuItems = dailyRows.map((r) => ({
      dailyMenuId: r.daily_id as string, stock: r.stock as number, ordersCount: r.orders_count as number,
      id: r.id as string, name: r.name as string, description: r.description as string | null,
      category: r.category as string, basePrice: r.price as number,
      segmentPrice: (r.segment_price as number | null) ?? (r.price as number),
      calories: r.calories as number | null, protein: r.protein as number | null,
      carbs: r.carbs as number | null, fat: r.fat as number | null,
      vitamins: (r.vitamins as string[]) ?? [], tags: r.tags as string[], image_url: r.image_url as string | null,
    }));
  } else {
    const allRows = await sql`
      SELECT m.id, m.name, m.description, m.category, m.price, m.calories,
             m.protein, m.carbs, m.fat, m.vitamins, m.tags, m.image_url,
             sp.price AS segment_price
      FROM menus m
      LEFT JOIN menu_segment_prices sp ON sp.menu_id = m.id AND sp.segment = ${userSegment} AND sp.active = true
      WHERE m.active = true
    `;
    menuItems = allRows.map((r) => ({
      dailyMenuId: null, stock: 50, ordersCount: 0,
      id: r.id as string, name: r.name as string, description: r.description as string | null,
      category: r.category as string, basePrice: r.price as number,
      segmentPrice: (r.segment_price as number | null) ?? (r.price as number),
      calories: r.calories as number | null, protein: r.protein as number | null,
      carbs: r.carbs as number | null, fat: r.fat as number | null,
      vitamins: (r.vitamins as string[]) ?? [], tags: r.tags as string[], image_url: r.image_url as string | null,
    }));
  }

  // Promociones activas
  const promoRows = await sql`
    SELECT id, name, discount_type, discount_value, min_order_total
    FROM promotions
    WHERE active = true
      AND (applies_to = 'all' OR applies_to = ${userSegment})
      AND valid_from <= ${today} AND valid_until >= ${today}
  `;

  const userInitial = ((profile?.full_name as string | null) ?? session?.user?.email ?? "U")[0].toUpperCase();
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
      promotions={promoRows.map((p) => ({
        id: p.id as string,
        name: p.name as string,
        discountType: p.discount_type as "percentage" | "fixed",
        discountValue: p.discount_value as number,
        minOrderTotal: p.min_order_total as number | null,
      }))}
    />
  );
}
