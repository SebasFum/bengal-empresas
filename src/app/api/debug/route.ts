import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "(no configurado)";
  const masked = dbUrl.length > 20
    ? dbUrl.slice(0, 30) + "..." + dbUrl.slice(-20)
    : dbUrl;

  try {
    const { sql } = await import("@/lib/db");
    const rows = await sql`SELECT COUNT(*) AS total FROM menus`;
    return NextResponse.json({
      ok: true,
      db_url_preview: masked,
      menus_count: Number(rows[0]?.total ?? 0),
    });
  } catch (e: unknown) {
    return NextResponse.json({
      ok: false,
      db_url_preview: masked,
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}
