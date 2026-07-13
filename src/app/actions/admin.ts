"use server";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendOrderOnTheWay } from "@/lib/email";
import type { Segment } from "@/lib/supabase/types";

type OrderStatus = "pendiente" | "en_produccion" | "en_camino" | "entregado" | "cancelado";
type ActionResult = { success: boolean; error?: string };

async function requireRole(roles: string[]): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "No autenticado." };
  if (!roles.includes(session.user.role)) return { ok: false, error: "Sin permisos." };
  return { ok: true, userId: session.user.id };
}

// ─── Estadísticas ─────────────────────────────────────────────

export async function getAdminStats() {
  const today = new Date().toISOString().split("T")[0];
  const [ordersRow, companiesRow, revenueRows] = await Promise.all([
    sql`SELECT COUNT(*) AS cnt FROM orders WHERE date = ${today} AND status != 'cancelado'`,
    sql`SELECT COUNT(*) AS cnt FROM companies WHERE active = true`,
    sql`SELECT total FROM orders WHERE date = ${today} AND status != 'cancelado'`,
  ]);
  return {
    todayOrders:    Number(ordersRow[0]?.cnt ?? 0),
    activeCompanies: Number(companiesRow[0]?.cnt ?? 0),
    revenueToday:   revenueRows.reduce((s, r) => s + Number(r.total ?? 0), 0),
  };
}

// ─── Order status ─────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<ActionResult> {
  const check = await requireRole(["admin", "cocina"]);
  if (!check.ok) return { success: false, error: check.error };

  await sql`UPDATE orders SET status = ${newStatus} WHERE id = ${orderId}`;

  if (newStatus === "en_camino") {
    sql`
      SELECT u.email, m.name AS menu_name
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN menus m ON m.id = o.menu_id
      WHERE o.id = ${orderId} LIMIT 1
    `.then((rows) => {
      const r = rows[0];
      if (!r) return;
      return sendOrderOnTheWay({
        to:       r.email as string,
        menuName: r.menu_name as string,
        orderId,
      });
    }).catch((e) => console.error("[email en camino]", e));
  }

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
  protein?: number;
  carbs?: number;
  fat?: number;
  vitamins?: string[];
  tags: string[];
  image_url?: string;
  active: boolean;
};

export async function upsertMenu(data: MenuInput): Promise<ActionResult & { id?: string }> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };

  if (data.id) {
    await sql`
      UPDATE menus SET
        name        = ${data.name},
        description = ${data.description ?? null},
        category    = ${data.category},
        price       = ${data.price},
        calories    = ${data.calories ?? null},
        protein     = ${data.protein ?? null},
        carbs       = ${data.carbs ?? null},
        fat         = ${data.fat ?? null},
        vitamins    = ${data.vitamins ?? []},
        tags        = ${data.tags},
        image_url   = ${data.image_url ?? null},
        active      = ${data.active}
      WHERE id = ${data.id}
    `;
    revalidatePath("/panel-admin"); revalidatePath("/pedidos");
    return { success: true, id: data.id };
  } else {
    const rows = await sql`
      INSERT INTO menus (name, description, category, price, calories, protein, carbs, fat, vitamins, tags, image_url, active)
      VALUES (${data.name}, ${data.description ?? null}, ${data.category}, ${data.price},
              ${data.calories ?? null}, ${data.protein ?? null}, ${data.carbs ?? null}, ${data.fat ?? null},
              ${data.vitamins ?? []}, ${data.tags}, ${data.image_url ?? null}, ${data.active})
      RETURNING id
    `;
    revalidatePath("/panel-admin"); revalidatePath("/pedidos");
    return { success: true, id: rows[0].id as string };
  }
}

export async function deleteMenu(id: string): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`UPDATE menus SET active = false WHERE id = ${id}`;
  revalidatePath("/panel-admin"); revalidatePath("/pedidos");
  return { success: true };
}

// ─── Menú del día ─────────────────────────────────────────────

export async function upsertDailyMenu(menuId: string, date: string, stock: number): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`
    INSERT INTO daily_menus (menu_id, date, stock, orders_count)
    VALUES (${menuId}, ${date}, ${stock}, 0)
    ON CONFLICT (menu_id, date) DO UPDATE SET stock = EXCLUDED.stock
  `;
  revalidatePath("/panel-admin"); revalidatePath("/pedidos");
  return { success: true };
}

export async function removeDailyMenu(id: string): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`DELETE FROM daily_menus WHERE id = ${id}`;
  revalidatePath("/panel-admin"); revalidatePath("/pedidos");
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
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };

  if (data.id) {
    await sql`
      UPDATE ingredients SET
        name            = ${data.name},
        unit            = ${data.unit},
        current_stock   = ${data.current_stock},
        cost_per_unit   = ${data.cost_per_unit ?? 0},
        min_stock_alert = ${data.min_stock_alert ?? 0}
      WHERE id = ${data.id}
    `;
    revalidatePath("/panel-admin");
    return { success: true, id: data.id };
  } else {
    const rows = await sql`
      INSERT INTO ingredients (name, unit, current_stock, cost_per_unit, min_stock_alert)
      VALUES (${data.name}, ${data.unit}, ${data.current_stock}, ${data.cost_per_unit ?? 0}, ${data.min_stock_alert ?? 0})
      RETURNING id
    `;
    revalidatePath("/panel-admin");
    return { success: true, id: rows[0].id as string };
  }
}

export async function adjustIngredientStock(id: string, delta: number): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`
    UPDATE ingredients SET current_stock = GREATEST(0, current_stock + ${delta}) WHERE id = ${id}
  `;
  revalidatePath("/panel-admin");
  return { success: true };
}

export async function setMenuIngredient(menuId: string, ingredientId: string, quantity: number): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`
    INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity)
    VALUES (${menuId}, ${ingredientId}, ${quantity})
    ON CONFLICT (menu_id, ingredient_id) DO UPDATE SET quantity = EXCLUDED.quantity
  `;
  revalidatePath("/panel-admin");
  return { success: true };
}

export async function removeMenuIngredient(menuId: string, ingredientId: string): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`DELETE FROM menu_ingredients WHERE menu_id = ${menuId} AND ingredient_id = ${ingredientId}`;
  revalidatePath("/panel-admin");
  return { success: true };
}

// ─── Precios por segmento ─────────────────────────────────────

export async function setSegmentPrice(menuId: string, segment: Segment, price: number): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`
    INSERT INTO menu_segment_prices (menu_id, segment, price, active)
    VALUES (${menuId}, ${segment}, ${price}, true)
    ON CONFLICT (menu_id, segment) DO UPDATE SET price = EXCLUDED.price, active = true
  `;
  revalidatePath("/panel-admin"); revalidatePath("/pedidos");
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
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };

  if (data.id) {
    await sql`
      UPDATE promotions SET
        name            = ${data.name},
        discount_type   = ${data.discount_type},
        discount_value  = ${data.discount_value},
        min_order_total = ${data.min_order_total ?? null},
        applies_to      = ${data.applies_to},
        valid_from      = ${data.valid_from},
        valid_until     = ${data.valid_until},
        active          = ${data.active}
      WHERE id = ${data.id}
    `;
  } else {
    await sql`
      INSERT INTO promotions (name, discount_type, discount_value, min_order_total, applies_to, valid_from, valid_until, active)
      VALUES (${data.name}, ${data.discount_type}, ${data.discount_value}, ${data.min_order_total ?? null},
              ${data.applies_to}, ${data.valid_from}, ${data.valid_until}, ${data.active})
    `;
  }
  revalidatePath("/panel-admin"); revalidatePath("/pedidos");
  return { success: true };
}

export async function togglePromotion(id: string, active: boolean): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`UPDATE promotions SET active = ${active} WHERE id = ${id}`;
  revalidatePath("/panel-admin"); revalidatePath("/pedidos");
  return { success: true };
}

// ─── Descuentos por cliente ───────────────────────────────────

export async function setClientDiscount(
  userId: string,
  discountType: "percentage" | "fixed",
  discountValue: number,
  validUntil: string,
): Promise<ActionResult> {
  const check = await requireRole(["admin"]);
  if (!check.ok) return { success: false, error: check.error };
  await sql`
    INSERT INTO client_discounts (user_id, discount_type, discount_value, valid_until, active)
    VALUES (${userId}, ${discountType}, ${discountValue}, ${validUntil}, true)
    ON CONFLICT (user_id) DO UPDATE SET
      discount_type  = EXCLUDED.discount_type,
      discount_value = EXCLUDED.discount_value,
      valid_until    = EXCLUDED.valid_until,
      active         = true
  `;
  revalidatePath("/panel-admin");
  return { success: true };
}
