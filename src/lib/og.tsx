import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/**
 * Social-share card builder. Satori (ImageResponse) only outputs PNG, and a
 * photographic 1200×630 PNG lands around 1MB — heavy for WhatsApp/Telegram
 * link previews. So we render just the text/gradient overlay with Satori
 * (transparent PNG), composite it onto the photo with sharp, and ship a
 * ~150-250KB JPEG instead.
 */

/** Load a bundled WebP photo as a sharp-ready buffer, or null if missing. */
export async function loadPhoto(dir: "blog" | "species", slug: string): Promise<Buffer | null> {
  try {
    // Slugs come straight from the URL — keep reads inside /public/images.
    if (!/^[a-z0-9-]+$/i.test(slug)) return null;
    return await readFile(path.join(process.cwd(), "public", "images", dir, `${slug}.webp`));
  } catch {
    return null;
  }
}

/** Admin "Featured Image" → buffer. Handles remote URLs and /public paths. */
export async function loadPhotoFromUrl(url: string): Promise<Buffer | null> {
  try {
    if (/^https?:\/\//i.test(url)) {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    }
    if (url.startsWith("/") && !url.includes("..")) {
      return await readFile(path.join(process.cwd(), "public", url.replace(/^\//, "")));
    }
    return null;
  } catch {
    return null;
  }
}

/** Compose the final JPEG: photo (or dark brand base) + Satori overlay. */
export async function composeOgJpeg(photo: Buffer | null, overlay: React.ReactElement): Promise<Buffer> {
  const sharp = (await import("sharp")).default;

  const overlayPng = Buffer.from(
    await new ImageResponse(overlay, { width: OG_WIDTH, height: OG_HEIGHT }).arrayBuffer()
  );

  const base = photo
    ? sharp(photo).resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "attention" })
    : sharp({
        create: {
          width: OG_WIDTH,
          height: OG_HEIGHT,
          channels: 3,
          background: { r: 11, g: 10, b: 15 },
        },
      });

  return base
    .composite([{ input: overlayPng }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

export function ogResponse(jpeg: Buffer) {
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

/** Shared overlay chrome: darkening gradient + brand footer row. */
export function OgFrame({
  children,
  withPhoto,
  host,
}: {
  children: React.ReactNode;
  withPhoto: boolean;
  host: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        position: "relative",
      }}
    >
      {/* readability gradient (or brand glow when there is no photo) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: withPhoto
            ? "linear-gradient(180deg, rgba(7,16,12,0.10) 28%, rgba(5,10,8,0.86) 78%, rgba(4,8,6,0.94) 100%)"
            : "radial-gradient(120% 90% at 85% 0%, rgba(16,185,129,0.28) 0%, rgba(11,10,15,0) 55%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 64px 56px",
          position: "relative",
        }}
      >
        {children}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 26 }}>
          <div style={{ display: "flex", fontSize: 34 }}>🕷️</div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
            <span style={{ color: "#F8FAF9" }}>Spider</span>
            <span style={{ color: "#10b981" }}>Identifier</span>
          </div>
          <div style={{ display: "flex", color: "rgba(248,250,249,0.55)", fontSize: 26 }}>· {host}</div>
        </div>
      </div>
    </div>
  );
}

export function OgChip({
  children,
  color = "green",
}: {
  children: React.ReactNode;
  color?: "green" | "red" | "amber";
}) {
  const palette = {
    green: { border: "rgba(16,185,129,0.55)", bg: "rgba(6,18,13,0.62)", text: "#6ee7b7" },
    red: { border: "rgba(255,110,134,0.7)", bg: "rgba(190,30,60,0.34)", text: "#ffd0d9" },
    amber: { border: "rgba(250,200,90,0.7)", bg: "rgba(180,120,20,0.34)", text: "#ffe9b8" },
  }[color];
  return (
    <div
      style={{
        display: "flex",
        padding: "8px 20px",
        borderRadius: 9999,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.text,
        fontSize: 26,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {children}
    </div>
  );
}
