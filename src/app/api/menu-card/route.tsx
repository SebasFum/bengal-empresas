import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const todayLabel = new Date(date + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  // Fetch today's menu from Supabase
  const supabase = await createClient();
  const { data: dailyMenus } = await supabase
    .from("daily_menus")
    .select("id, stock, orders_count, menus ( name, description, price, category, calories )")
    .eq("date", date)
    .gt("stock", 0);

  const items = (dailyMenus ?? [])
    .filter((dm) => dm.menus)
    .map((dm) => ({
      name: (dm.menus as { name: string; description: string | null; price: number; category: string; calories: number | null }).name,
      price: (dm.menus as { price: number }).price,
      remaining: dm.stock - dm.orders_count,
    }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg, #FAF7F2 0%, #F5EDE0 50%, #EDD9C4 100%)",
          padding: "60px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Decorative top bar */}
        <div style={{ width: "100%", height: "6px", background: "linear-gradient(90deg, #C4704F, #D4A853)", borderRadius: "3px", marginBottom: "48px", display: "flex" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "#C4704F", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "white", fontSize: "32px", fontWeight: "bold" }}>B</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "42px", fontWeight: "bold", color: "#2C2825", lineHeight: 1 }}>Bengal</span>
            <span style={{ fontSize: "18px", color: "#8B7355", letterSpacing: "0.12em", textTransform: "uppercase" }}>Catering & Empresas</span>
          </div>
        </div>

        {/* Date */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px" }}>
          <div style={{ width: "4px", height: "28px", background: "#C4704F", borderRadius: "2px", display: "flex" }} />
          <span style={{ fontSize: "26px", color: "#5C4A3A", fontWeight: "600", textTransform: "capitalize" }}>
            Menú del {todayLabel}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(196,112,79,0.3)", marginBottom: "36px", display: "flex" }} />

        {/* Menu items */}
        {items.length === 0 ? (
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "28px", color: "#A89E93" }}>Menú próximamente</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
            {items.slice(0, 6).map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(255,255,255,0.65)", borderRadius: "16px",
                padding: "20px 28px", border: "1px solid rgba(196,112,79,0.15)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: i % 2 === 0 ? "#C4704F" : "#D4A853",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "18px", fontWeight: "bold", flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "26px", color: "#2C2825", fontWeight: "600" }}>{item.name}</span>
                </div>
                <span style={{ fontSize: "26px", color: "#C4704F", fontWeight: "bold" }}>
                  ${item.price.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "36px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "18px", color: "#8B7355" }}>📲 Pedidos hasta las 10:00 hs</span>
            <span style={{ fontSize: "18px", color: "#8B7355" }}>✉️ @bengal.catering</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: "16px", color: "#A89E93" }}>bengal.com.ar</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ width: "100%", height: "6px", background: "linear-gradient(90deg, #D4A853, #C4704F)", borderRadius: "3px", marginTop: "32px", display: "flex" }} />
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}
