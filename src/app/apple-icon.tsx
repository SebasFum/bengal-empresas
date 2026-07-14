import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
        }}
      >
        <span
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: 108,
            color: "#C9A45C",
            lineHeight: 1,
            transform: "translateY(-4px)",
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
