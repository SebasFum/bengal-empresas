import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url   = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);

  const rows = await sql`
    SELECT o.menu_id, o.date::text AS date, m.name AS menu_name
    FROM orders o
    JOIN menus m ON m.id = o.menu_id
    WHERE o.user_id = ${session.user.id} AND o.status != 'cancelado'
    ORDER BY o.date DESC
    LIMIT ${limit}
  `;
  return NextResponse.json(rows);
}
