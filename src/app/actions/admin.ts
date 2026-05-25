"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Segment } from "@/lib/supabase/types";

type OrderStatus = "pendiente" | "en_produccion" | "en_camino" | "entregado" | "cancelado";
type ActionResult = { success: boolean; error?: string };

// ─── Auth helper ─────────────────────────────────────────────
async function requireRole(roles: string[]): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !roles.includes(profile.role)) return { ok: false, error: "Sin permisos." };
  return { ok: true, userId: user.id };
}

// ─── Estadísticas ─────────────────────────────────────────────
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

// ─── Order status ─────────────────────────────────────────────
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<ActionResult> {
  const auth = await requireRole(["admin", "cocina"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/panel-admin");
  return { success: true };
}

// ─── Menús CRUD ───────────────────────────────────────────────
export type MenuInput = {
  id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  calories?: number;
  tags: string[];
  image_url?: string;
  active: boolean;
};

export async function upsertMenu(data: MenuInput): Promise<ActionResult & { id?: string }> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const payload = {
    name: data.name,
    description: data.description || null,
    category: data.category,
    price: data.price,
    calories: data.calories || null,
    tags: data.tags,
    image_url: data.image_url || null,
    active: data.active,
  };

  if (data.id) {
    const { error } = await supabase.from("menus").update(payload).eq("id", data.id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/panel-admin");
    revalidatePath("/pedidos");
    return { success: true, id: data.id };
  } else {
    const { data: inserted, error } = await supabase.from("menus").insert(payload).select("id").single();
    if (error) return { success: false, error: error.message };
    revalidatePath("/panel-admin");
    revalidatePath("/pedidos");
    return { success: true, id: inserted.id };
  }
}

export async function deleteMenu(id: string): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("menus").update({ active: false }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  revalidatePath("/pedidos");
  return { success: true };
}

// ─── Menú del día ─────────────────────────────────────────────
export async function upsertDailyMenu(menuId: string, date: string, stock: number): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_menus")
    .upsert({ menu_id: menuId, date, stock, orders_count: 0 }, { onConflict: "menu_id,date" });
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  revalidatePath("/pedidos");
  return { success: true };
}

export async function removeDailyMenu(id: string): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("daily_menus").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  revalidatePath("/pedidos");
  return { success: true };
}

// ─── Ingredientes ─────────────────────────────────────────────
export type IngredientInput = {
  id?: string;
  name: string;
  unit: string;
  current_stock: number;
  cost_per_unit?: number;
  min_stock_alert?: number;
};

export async function upsertIngredient(data: IngredientInput): Promise<ActionResult & { id?: string }> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const payload = {
    name: data.name,
    unit: data.unit,
    current_stock: data.current_stock,
    cost_per_unit: data.cost_per_unit,
    min_stock_alert: data.min_stock_alert,
  };

  if (data.id) {
    const { error } = await supabase.from("ingredients").update(payload).eq("id", data.id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/panel-admin");
    return { success: true, id: data.id };
  } else {
    const { data: inserted, error } = await supabase.from("ingredients").insert(payload).select("id").single();
    if (error) return { success: false, error: error.message };
    revalidatePath("/panel-admin");
    return { success: true, id: inserted.id };
  }
}

export async function adjustIngredientStock(id: string, delta: number): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { data: ing } = await supabase.from("ingredients").select("current_stock").eq("id", id).single();
  if (!ing) return { success: false, error: "Ingrediente no encontrado." };

  const newQty = Math.max(0, ing.current_stock + delta);
  const { error } = await supabase.from("ingredients").update({ current_stock: newQty }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  return { success: true };
}

export async function setMenuIngredient(menuId: string, ingredientId: string, quantity: number): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_ingredients")
    .upsert({ menu_id: menuId, ingredient_id: ingredientId, quantity }, { onConflict: "menu_id,ingredient_id" });
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  return { success: true };
}

export async function removeMenuIngredient(menuId: string, ingredientId: string): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("menu_ingredients").delete().eq("menu_id", menuId).eq("ingredient_id", ingredientId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  return { success: true };
}

// ─── Precios por segmento ─────────────────────────────────────
export async function setSegmentPrice(menuId: string, segment: Segment, price: number): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_segment_prices")
    .upsert({ menu_id: menuId, segment, price, active: true }, { onConflict: "menu_id,segment" });
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  revalidatePath("/pedidos");
  return { success: true };
}

// ─── Promociones ──────────────────────────────────────────────
export type PromotionInput = {
  id?: string;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_total?: number;
  applies_to: "all" | Segment;
  valid_from: string;
  valid_until: string;
  active: boolean;
};

export async function upsertPromotion(data: PromotionInput): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const payload = {
    name: data.name,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order_total: data.min_order_total ?? null,
    applies_to: data.applies_to,
    valid_from: data.valid_from,
    valid_until: data.valid_until,
    active: data.active,
  };

  if (data.id) {
    const { error } = await supabase.from("promotions").update(payload).eq("id", data.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("promotions").insert(payload);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath("/panel-admin");
  revalidatePath("/pedidos");
  return { success: true };
}

export async function togglePromotion(id: string, active: boolean): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("promotions").update({ active }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  revalidatePath("/pedidos");
  return { success: true };
}

// ─── Descuentos por cliente ───────────────────────────────────
export async function setClientDiscount(
  userId: string,
  discountType: "percentage" | "fixed",
  discountValue: number,
  validUntil: string,
): Promise<ActionResult> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("client_discounts")
    .upsert(
      { user_id: userId, discount_type: discountType, discount_value: discountValue, valid_until: validUntil, active: true },
      { onConflict: "user_id" },
    );
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel-admin");
  return { success: true };
}
