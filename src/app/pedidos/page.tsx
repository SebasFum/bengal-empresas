import { createClient } from "@/lib/supabase/server";
import { menuCategories } from "@/lib/data";
import PedidosClient from "./PedidosClient";

export type MenuItem = {
  dailyMenuId: string | null;
  stock: number;
  ordersCount: number;
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  calories: number | null;
  tags: string[];
  image_url: string | null;
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Intentar obtener el menú del día
  const { data: dailyMenus } = await supabase
    .from("daily_menus")
    .select(`
      id, date, stock, orders_count,
      menus ( id, name, description, category, price, calories, tags, image_url )
    `)
    .eq("date", today)
    .gt("stock", 0);

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
          dailyMenuId: dm.id,
          stock: dm.stock,
          ordersCount: dm.orders_count,
          id: m.id, name: m.name, description: m.description,
          category: m.category, price: m.price, calories: m.calories,
          tags: m.tags, image_url: m.image_url,
        };
      });
  } else {
    // Fallback: todos los menús activos si no hay daily_menus para hoy
    const { data: allMenus } = await supabase
      .from("menus")
      .select("id, name, description, category, price, calories, tags, image_url")
      .eq("active", true);
    menuItems = (allMenus ?? []).map((m) => ({
      dailyMenuId: null, stock: 50, ordersCount: 0, ...m,
    }));
  }

  // Datos del usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    : { data: null };

  const userInitial = (profile?.full_name ?? user?.email ?? "U")[0].toUpperCase();
  const today_label = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <PedidosClient
      menuItems={menuItems}
      categories={menuCategories}
      today={today}
      todayLabel={today_label}
      userInitial={userInitial}
    />
  );
}
