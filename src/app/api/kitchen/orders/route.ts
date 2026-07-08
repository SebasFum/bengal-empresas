import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  if (!session?.user?.id || !["cocina", "admin"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const today = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const [activeRows, doneRows] = await Promise.all([
    sql`SELECT o.id, o.status, o.extras, o.notes, o.total, o.created_at,
               o.segment, o.menu_id, o.user_id, m.name AS menu_name
        FROM orders o JOIN menus m ON m.id = o.menu_id
        WHERE o.date = ${today} AND o.status IN ('pendiente','en_produccion')
        ORDER BY o.created_at ASC`,
    sql`SELECT COUNT(*) AS cnt FROM orders
        WHERE date = ${today} AND status IN ('en_camino','entregado')`,
  ]);

  const uniqueUserIds = [...new Set(activeRows.map((o) => o.user_id as string))];
  const nameRows = uniqueUserIds.length > 0
    ? await sql`SELECT id, full_name FROM profiles WHERE id = ANY(${uniqueUserIds})`
    : [];
  const nameMap = Object.fromEntries(nameRows.map((p) => [p.id as string, (p.full_name as string) ?? "Cliente"]));

  return NextResponse.json({
    orders: activeRows.map((o) => ({
      id: o.id,
      status: o.status,
      extras: o.extras,
      notes: o.notes,
      total: Number(o.total),
      created_at: o.created_at,
      segment: o.segment,
      menuId: o.menu_id,
      menuName: (o.menu_name as string) ?? "—",
      userName: nameMap[o.user_id as string] ?? "Cliente",
    })),
    dispatchedCount: Number(doneRows[0]?.cnt ?? 0),
  });
}
