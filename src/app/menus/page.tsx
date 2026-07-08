import { sql } from "@/lib/db";
import MenusClient from "./MenusClient";
import type { Menu } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export type MenusByCategory = Record<string, Menu[]>;

const CATEGORY_ORDER = ["entrada", "almuerzo", "postre", "bebida", "extra", "ensalada"];

export default async function MenusPage() {
  const rows = await sql`
    SELECT id, name, description, category, price, calories, protein, carbs, fat,
           vitamins, tags, image_url, active, created_at
    FROM menus WHERE active = true ORDER BY name
  `;
  const menus = rows as unknown as Menu[];

  const grouped: MenusByCategory = {};
  for (const cat of CATEGORY_ORDER) {
    const items = menus.filter((m) => m.category === cat);
    if (items.length > 0) grouped[cat] = items;
  }
  for (const m of menus) {
    if (!CATEGORY_ORDER.includes(m.category)) {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push(m);
    }
  }

  return <MenusClient grouped={grouped} totalItems={menus.length} />;
}
