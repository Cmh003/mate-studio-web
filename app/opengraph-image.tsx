import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { baseUrl } from "@/lib/url";

// Imagen que aparece al compartir el enlace en WhatsApp, LinkedIn, etc.
export const alt = "Mate Studio — Webs a medida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logo = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="30" fill="#F5F5F2"/><path d="M22 85 V50 a15 15 0 0 1 30 0 V85 M52 50 a15 15 0 0 1 30 0 V85" fill="none" stroke="#0C0C0E" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><circle cx="99" cy="83" r="7.5" fill="#C6F432"/></svg>',
)}`;

export default async function Image() {
  const dir = join(process.cwd(), "assets/og");
  const [medium, bold] = await Promise.all([readFile(join(dir, "SpaceGrotesk-Medium.ttf")), readFile(join(dir, "SpaceGrotesk-Bold.ttf"))]);
  const domain = baseUrl().replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#0C0C0E",
          color: "#F5F5F2",
          fontFamily: "Space Grotesk",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -160,
            top: -120,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: "radial-gradient(circle, rgba(198,244,50,0.28), rgba(198,244,50,0) 65%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={logo} width={72} height={72} alt="" />
          <div style={{ display: "flex", fontSize: 38, letterSpacing: -1 }}>
            <span style={{ fontWeight: 700 }}>mate</span>
            <span style={{ color: "#8A8A92", marginLeft: 10 }}>studio</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 500, lineHeight: 1, letterSpacing: -4 }}>
            <span>Webs a medida</span>
            <div style={{ display: "flex" }}>
              <span>que se recuerdan</span>
              <span style={{ color: "#C6F432" }}>.</span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#A1A1AA" }}>Diseño y desarrollo para negocios · {site.city}</div>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", background: "#C6F432", color: "#0C0C0E", fontSize: 28, fontWeight: 700, padding: "14px 30px", borderRadius: 999 }}>
            {domain}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: medium, weight: 500, style: "normal" },
        { name: "Space Grotesk", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
