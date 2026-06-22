import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getAccessToken } from "@/lib/google";

export const runtime = "nodejs";

/**
 * Admin-only diagnostic: shows EXACTLY which Google credentials the live
 * server is using right now and whether they mint a token. Use this to
 * confirm the deployed worker picked up the correct service-account email
 * (the service-account email is not secret; the private key is never shown).
 */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "(NOT SET)";
  const key = process.env.GOOGLE_PRIVATE_KEY || "";

  const out: Record<string, unknown> = {
    serviceAccountEmail: email,
    ga4PropertyId: process.env.GA4_PROPERTY_ID || "(NOT SET)",
    gscSiteUrl: process.env.GSC_SITE_URL || "(NOT SET)",
    privateKey: key
      ? {
          present: true,
          length: key.length,
          startsWith: key.slice(0, 30),
          endsWith: key.slice(-26),
          escapedNewlines: key.includes("\\n"),
          realNewlines: key.includes("\n"),
        }
      : { present: false },
  };

  try {
    const token = await getAccessToken();
    if (!token) {
      out.auth = "Not configured (missing email or key)";
    } else {
      out.auth = "✅ Token minted — Google authentication works";
      const prop = process.env.GA4_PROPERTY_ID;
      if (prop) {
        const ga = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${prop}:runReport`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], metrics: [{ name: "activeUsers" }] }),
        });
        out.ga4Probe = { status: ga.status, body: (await ga.text()).slice(0, 240) };
      }
    }
  } catch (e) {
    out.auth = "❌ FAILED: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
