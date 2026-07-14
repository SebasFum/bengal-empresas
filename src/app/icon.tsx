import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const fontData = await readFile(
    join(process.cwd(), "src/assets/fonts/CormorantGaramond-Bold.woff")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0A09",
          borderRadius: "50%",
          border: "2px solid #C9A45C",
        }}
      >
        <span
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: 40,
            color: "#C9A45C",
            lineHeight: 1,
            transform: "translateY(-1px)",
          }}
        >
          B
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Cormorant Garamond", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
