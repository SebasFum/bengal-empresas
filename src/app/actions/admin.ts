"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type OrderStatus = "pendiente" | "en_produccion" | "en_camino" | "entregado" | "cancelado";

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { success: false, error: "Sin permisos." };

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/panel-admin");
  return { success: true };
}

export async function getAdminStats() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: todayOrders },
    { count: activeCompanies },
    { data: revenue },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("date", today).neq("status", "cancelado"),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("orders").select("total").eq("date", today).neq("status", "cancelado"),
  ]);

  return {
    todayOrders: todayOrders ?? 0,
    activeCompanies: activeCompanies ?? 0,
    revenueToday: (revenue ?? []).reduce((s, o) => s + (o.total ?? 0), 0),
  };
}
