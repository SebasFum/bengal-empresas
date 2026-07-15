import { ImageResponse } from "next/og";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

// Fallback images per course type
const FALLBACK: Record<string, string> = {
  entrada:  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80",
  almuerzo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  especial: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  postre:   "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=80",
  default:  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
};

// Category display names & accent colours
const COURSE_LABEL: Record<string, string> = {
  entrada:  "Entrada",
  almuerzo: "Plato Principal",
  especial: "Plato del día",
  postre:   "Postre",
  bebida:   "Bebida",
};
const COURSE_COLOR = ["#D4A853", "#C4704F", "#8FBCB0"] as const; // gold · terracotta · sage
const COURSE_ORDER = ["entrada", "almuerzo", "especial", "postre", "bebida"];

type MenuItem = { name: string; price: number; category: string; image_url: string | null };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const todayLabel = new Date(date + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  // ── Fetch today's menu ─────────────────────────────────────
  const rows = await sql`
    SELECT m.name, m.price, m.category, m.image_url
    FROM daily_menus dm JOIN menus m ON m.id = dm.menu_id
    WHERE dm.date = ${date} AND dm.stock > 0
  `;

  let items: MenuItem[] = rows
    .map((r) => ({ name: r.name as string, price: Number(r.price), category: r.category as string, image_url: r.image_url as string | null }))
    .sort((a, b) => {
      const ai = COURSE_ORDER.indexOf(a.category);
      const bi = COURSE_ORDER.indexOf(b.category);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .slice(0, 3);

  // Pad to exactly 3 if menu isn't configured yet
  const placeholders: MenuItem[] = [
    { name: "Entrada del día",        price: 0, category: "entrada",  image_url: null },
    { name: "Plato principal del día", price: 0, category: "almuerzo", image_url: null },
    { name: "Postre del día",          price: 0, category: "postre",   image_url: null },
  ];
  while (items.length < 3) items.push(placeholders[items.length]);

  // ── Layout constants ───────────────────────────────────────
  // Header: 120px  |  3 strips: 290px each  |  Footer: 90px  = 1080px
  const HEADER = 120;
  const FOOTER = 90;
  const STRIP  = (1080 - HEADER - FOOTER) / 3; // 290px

  return new ImageResponse(
    (
      <div style={{
        width: "1080px",
        height: "1080px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Georgia, 'Times New Roman', serif",
        backgroundColor: "#1a1512",
        overflow: "hidden",
      }}>

        {/* ════ HEADER ════ */}
        <div style={{
          height: `${HEADER}px`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 52px",
          background: "linear-gradient(135deg, #2C2825 0%, #1a1512 100%)",
          borderBottom: "2px solid #C4704F",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{
              width: "62px", height: "62px", borderRadius: "50%",
              background: "#C4704F",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "white", fontSize: "30px", fontWeight: "bold" }}>B</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "38px", fontWeight: "bold", color: "#FAF7F2", lineHeight: 1 }}>Bengal</span>
              <span style={{ fontSize: "12px", color: "#D4A853", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                Catering & Empresas
              </span>
            </div>
          </div>
          {/* Date */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <span style={{ fontSize: "20px", color: "#FAF7F2", fontWeight: "600" }}>Menú del día</span>
            <span style={{ fontSize: "15px", color: "#A89E93", textTransform: "capitalize" }}>{todayLabel}</span>
          </div>
        </div>

        {/* ════ 3 COURSE STRIPS ════ */}
        {items.map((item, i) => {
          const label = COURSE_LABEL[item.category] ?? ["Entrada", "Plato Principal", "Postre"][i];
          const color = COURSE_COLOR[i];
          const imgSrc = item.image_url ?? FALLBACK[item.category] ?? FALLBACK.default;

          return (
            <div key={i} style={{
              height: `${STRIP}px`,
              flexShrink: 0,
              position: "relative",
              display: "flex",
              overflow: "hidden",
            }}>
              {/* ── Food photo (full bleed) ── */}
              <img
                src={imgSrc}
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />

              {/* ── Gradient overlay: opaque-left → transparent-right ── */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background:
                  "linear-gradient(to right, rgba(15,10,6,0.92) 0%, rgba(15,10,6,0.72) 38%, rgba(15,10,6,0.28) 70%, rgba(15,10,6,0.0) 100%)",
                display: "flex",
              }} />

              {/* ── Text (left column) ── */}
              <div style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 52px",
                gap: "10px",
                maxWidth: "62%",
              }}>
                {/* Course tag */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "3px", height: "22px",
                    background: color,
                    borderRadius: "2px",
                    display: "flex", flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color,
                  }}>
                    {label}
                  </span>
                </div>

                {/* Dish name */}
                <span style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#FAF7F2",
                  lineHeight: 1.18,
                }}>
                  {item.name}
                </span>

                {/* Price */}
                {item.price > 0 && (
                  <span style={{
                    fontSize: "22px",
                    color: "rgba(250,247,242,0.55)",
                  }}>
                    ${Number(item.price).toLocaleString("es-AR")}
                  </span>
                )}
              </div>

              {/* ── Numbered badge (right) ── */}
              <div style={{
                position: "absolute",
                right: "44px",
                top: 0, bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{
                  width: "58px", height: "58px",
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color,
                  fontSize: "28px",
                  fontWeight: "bold",
                }}>
                  {i + 1}
                </div>
              </div>

              {/* ── Thin separator (between strips) ── */}
              {i < 2 && (
                <div style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  height: "1px",
                  background: "rgba(255,255,255,0.10)",
                  display: "flex",
                }} />
              )}
            </div>
          );
        })}

        {/* ════ FOOTER ════ */}
        <div style={{
          height: `${FOOTER}px`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 52px",
          background: "linear-gradient(135deg, #1a1512 0%, #2C2825 100%)",
          borderTop: "1px solid rgba(196,112,79,0.35)",
        }}>
          <span style={{ fontSize: "16px", color: "#7A6E65" }}>
            📲 Pedidos hasta las 10:00 hs
          </span>
          <span style={{ fontSize: "20px", color: "#D4A853", fontWeight: "600", letterSpacing: "0.04em" }}>
            @bengal.catering
          </span>
        </div>

      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
