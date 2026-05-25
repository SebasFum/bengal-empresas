"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendOrderConfirmation } from "@/lib/email";

export type PlaceOrderInput = {
  menu_id: string;
  daily_menu_id?: string;
  date: string;          // ISO string "2025-01-18"
  extras: string[];
  notes: string;
  total: number;
};

export type ActionResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult> {
  const supabase = await createClient();

  // Verificar sesión activa
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Tenés que iniciar sesión para hacer un pedido." };
  }

  // Obtener company_id del perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  // Insertar el pedido
  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      company_id: profile?.company_id ?? null,
      menu_id: input.menu_id,
      daily_menu_id: input.daily_menu_id ?? null,
      date: input.date,
      status: "pendiente",
      extras: input.extras,
      notes: input.notes || null,
      total: input.total,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[placeOrder] insert error:", insertError);
    return { success: false, error: "No se pudo registrar el pedido. Intentá de nuevo." };
  }

  // Incrementar orders_count en daily_menus si hay daily_menu_id
  if (input.daily_menu_id) {
    await supabase.rpc("increment_orders_count", {
      p_daily_menu_id: input.daily_menu_id,
    });
  }

  // Email de confirmación — no blocking
  const { data: menuData } = await supabase
    .from("menus").select("name, price").eq("id", input.menu_id).single();

  sendOrderConfirmation({
    to: user.email ?? "",
    menuName: menuData?.name ?? "Tu pedido",
    date: input.date,
    extras: input.extras,
    notes: input.notes,
    total: input.total,
    orderId: order.id,
  }).catch((e) => console.error("[email]", e));

  revalidatePath("/pedidos");
  revalidatePath("/historial");

  return { success: true, orderId: order.id };
}

export async function getMyOrders() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      date,
      status,
      extras,
      notes,
      total,
      created_at,
      menus ( id, name, description, category, price, image_url )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getMyOrders] error:", error);
    return [];
  }

  return data ?? [];
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelado" })
    .eq("id", orderId)
    .eq("user_id", user.id)           // solo el dueño del pedido
    .in("status", ["pendiente"]);     // solo si aún no está en producción

  if (error) {
    return { success: false, error: "No se pudo cancelar el pedido." };
  }

  revalidatePath("/historial");
  return { success: true, orderId };
}

export async function getTodayMenus() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_menus")
    .select(`
      id,
      date,
      stock,
      orders_count,
      menus ( id, name, description, category, price, calories, tags, image_url, active )
    `)
    .eq("date", today)
    .gt("stock", 0);

  if (error) {
    console.error("[getTodayMenus] error:", error);
    return [];
  }

  return data ?? [];
}
