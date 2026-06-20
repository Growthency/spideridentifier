import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

// Runs in the default Node runtime — OpenNext/Cloudflare bundles the whole app
// as a single Node Worker, so a separate edge function isn't used.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(120% 90% at 50% 0%, #1a1209 0%, #0B0A0F 55%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "rgba(16,185,129,0.35)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -100,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: "rgba(13,148,136,0.32)",
            filter: "blur(130px)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 88, display: "flex" }}>🕷️</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>
            <span style={{ color: "#F5F3EE" }}>Spider</span>
            <span style={{ color: "#10b981" }}>Identifier</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 40,
            fontWeight: 600,
            color: "#F5F3EE",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Identify any spider from a photo — instantly
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
          {["AI-Powered", "50,000+ Species", "Venom Risk Alerts"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 9999,
                border: "1px solid rgba(16,185,129,0.4)",
                color: "#6ee7b7",
                fontSize: 24,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
