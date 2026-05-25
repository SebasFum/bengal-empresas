import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CocinaClient from "./CocinaClient";

export default async function CocinaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
    : { data: null };

  if (!profile || !["cocina", "admin"].includes(profile.role)) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Pedidos activos de hoy (pendiente + en_produccion)
  const { data: activeOrders } = await supabase
    .from("orders")
    .select("id, status, extras, notes, total, created_at, segment, menu_id, user_id, menus ( id, name, category )")
    .eq("date", today)
    .in("status", ["pendiente", "en_produccion"])
    .order("created_at", { ascending: true });

  // Nombres de usuarios para esas órdenes
  const userIds = [...new Set((activeOrders ?? []).map((o) => o.user_id))];
  const { data: profileNames } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };
  const nameMap = Object.fromEntries((profileNames ?? []).map((p) => [p.id, p.full_name ?? "Cliente"]));

  // Resumen de menús despachados hoy
  const { data: doneOrders } = await supabase
    .from("orders")
    .select("id, status, menus ( name )")
    .eq("date", today)
    .in("status", ["en_camino", "entregado"]);

  const enriched = (activeOrders ?? []).map((o) => ({
    id: o.id,
    status: o.status as "pendiente" | "en_produccion",
    extras: o.extras,
    notes: o.notes,
    total: o.total,
    created_at: o.created_at,
    segment: o.segment,
    menuId: o.menu_id,
    menuName: (o.menus as { id: string; name: string; category: string } | null)?.name ?? "—",
    userName: nameMap[o.user_id] ?? "Cliente",
  }));

  return (
    <CocinaClient
      initialOrders={enriched}
      dispatchedCount={doneOrders?.length ?? 0}
      today={today}
      staffName={profile.full_name ?? "Cocina"}
    />
  );
}
