import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import CocinaClient from "./CocinaClient";

export default async function CocinaPage() {
  const session = await auth();
  const userId  = session?.user?.id;
  const role    = session?.user?.role ?? "";

  if (!userId || !["cocina", "admin"].includes(role)) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const [activeRows, doneRows, profileRows] = await Promise.all([
    sql`SELECT o.id, o.status, o.extras, o.notes, o.total, o.created_at,
               o.segment, o.menu_id, o.user_id, m.name AS menu_name
        FROM orders o JOIN menus m ON m.id = o.menu_id
        WHERE o.date = ${today} AND o.status IN ('pendiente','en_produccion')
        ORDER BY o.created_at ASC`,
    sql`SELECT COUNT(*) AS cnt FROM orders
        WHERE date = ${today} AND status IN ('en_camino','entregado')`,
    sql`SELECT full_name FROM profiles WHERE id = ${userId} LIMIT 1`,
  ]);

  const uniqueUserIds = [...new Set(activeRows.map((o) => o.user_id as string))];
  const nameRows = uniqueUserIds.length > 0
    ? await sql`SELECT id, full_name FROM profiles WHERE id = ANY(${uniqueUserIds})`
    : [];
  const nameMap = Object.fromEntries(nameRows.map((p) => [p.id as string, (p.full_name as string) ?? "Cliente"]));

  const enriched = activeRows.map((o) => ({
    id: o.id as string,
    status: o.status as "pendiente" | "en_produccion",
    extras: o.extras as string[],
    notes: o.notes as string | null,
    total: o.total as number,
    created_at: o.created_at as string,
    segment: o.segment as string | null,
    menuId: o.menu_id as string,
    menuName: (o.menu_name as string) ?? "—",
    userName: nameMap[o.user_id as string] ?? "Cliente",
  }));

  return (
    <CocinaClient
      initialOrders={enriched}
      dispatchedCount={Number(doneRows[0]?.cnt ?? 0)}
      today={today}
      staffName={(profileRows[0]?.full_name as string) ?? "Cocina"}
    />
  );
}
