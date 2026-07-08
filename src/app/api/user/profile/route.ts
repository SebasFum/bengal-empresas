import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await sql`
    SELECT full_name, dietary_restrictions, phone, company_id
    FROM profiles WHERE id = ${session.user.id} LIMIT 1
  `;
  return NextResponse.json(rows[0] ?? {});
}
