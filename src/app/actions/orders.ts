"use server";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendOrderConfirmation } from "@/lib/email";
import type { Segment } from "@/lib/supabase/types";

export type PlaceOrderInput = {
  menu_id: string;
  daily_menu_id?: string;
  date: string;
  extras: string[];
  notes: string;
  total: number;
  segment?: Segment;
};

export type ActionResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Tenés que iniciar sesión para hacer un pedido." };
  const userId = session.user.id;

  const profileRows = await sql`SELECT company_id FROM profiles WHERE id = ${userId} LIMIT 1`;
  const companyId   = (profileRows[0]?.company_id as string | null) ?? null;

  const orderRows = await sql`
    INSERT INTO orders (user_id, company_id, menu_id, daily_menu_id, date, status, extras, notes, total, segment)
    VALUES (
      ${userId}, ${companyId}, ${input.menu_id},
      ${input.daily_menu_id ?? null}, ${input.date},
      'pendiente',
      ${input.extras}, ${input.notes || null}, ${input.total},
      ${input.segment ?? null}
    )
    RETURNING id
  `;
  const order = orderRows[0];
  if (!order) return { success: false, error: "No se pudo registrar el pedido. Intentá de nuevo." };

  if (input.daily_menu_id) {
    await sql`
      UPDATE daily_menus
      SET orders_count = orders_count + 1
      WHERE id = ${input.daily_menu_id} AND orders_count < stock
    `;
  }

  const menuRows = await sql`SELECT name, price FROM menus WHERE id = ${input.menu_id} LIMIT 1`;
  const menuData  = menuRows[0];

  sendOrderConfirmation({
    to:       session.user.email ?? "",
    menuName: (menuData?.name as string) ?? "Tu pedido",
    date:     input.date,
    extras:   input.extras,
    notes:    input.notes,
    total:    input.total,
    orderId:  order.id as string,
  }).catch((e) => console.error("[email]", e));

  revalidatePath("/pedidos");
  revalidatePath("/historial");

  return { success: true, orderId: order.id as string };
}

export async function getMyOrders() {
  const session = await auth();
  if (!session?.user) return [];

  const rows = await sql`
    SELECT
      o.id, o.date, o.status, o.extras, o.notes, o.total, o.created_at,
      m.id AS menu_id, m.name AS menu_name, m.description AS menu_description,
      m.category AS menu_category, m.price AS menu_price, m.image_url AS menu_image_url
    FROM orders o
    JOIN menus m ON m.id = o.menu_id
    WHERE o.user_id = ${session.user.id}
    ORDER BY o.created_at DESC
    LIMIT 50
  `;

  return rows.map((r) => ({
    id:         r.id as string,
    date:       r.date as string,
    status:     r.status as string,
    extras:     r.extras as string[],
    notes:      r.notes as string | null,
    total:      r.total as number,
    created_at: r.created_at as string,
    menus: {
      id:          r.menu_id as string,
      name:        r.menu_name as string,
      description: r.menu_description as string | null,
      category:    r.menu_category as string,
      price:       r.menu_price as number,
      image_url:   r.menu_image_url as string | null,
    },
  }));
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado." };

  await sql`
    UPDATE orders
    SET status = 'cancelado'
    WHERE id = ${orderId}
      AND user_id = ${session.user.id}
      AND status = 'pendiente'
  `;

  revalidatePath("/historial");
  return { success: true, orderId };
}

export async function getTodayMenus() {
  const today = new Date().toISOString().split("T")[0];

  const rows = await sql`
    SELECT
      dm.id, dm.date, dm.stock, dm.orders_count,
      m.id AS menu_id, m.name, m.description, m.category, m.price,
      m.calories, m.tags, m.image_url, m.active
    FROM daily_menus dm
    JOIN menus m ON m.id = dm.menu_id
    WHERE dm.date = ${today} AND dm.stock > 0
  `;

  return rows.map((r) => ({
    id:           r.id as string,
    date:         r.date as string,
    stock:        r.stock as number,
    orders_count: r.orders_count as number,
    menus: {
      id:          r.menu_id as string,
      name:        r.name as string,
      description: r.description as string | null,
      category:    r.category as string,
      price:       r.price as number,
      calories:    r.calories as number | null,
      tags:        r.tags as string[],
      image_url:   r.image_url as string | null,
      active:      r.active as boolean,
    },
  }));
}
