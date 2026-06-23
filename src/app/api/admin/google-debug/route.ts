import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getAccessToken, gEnv, loadGoogleCreds } from "@/lib/google";

export const runtime = "nodejs";

/**
 * Admin-only diagnostic: shows EXACTLY which Google credentials the live
 * server is using right now and whether they mint a token. Use this to confirm
 * the worker reads the correct service-account email — from the Supabase
 * `secure_config` row first, then env (the service-account email is not secret;
 * the private key is never shown).
 */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // What the code actually uses now: DB (secure_config) first, env fallback.
  const creds = await loadGoogleCreds(true);
  const key = creds.privateKey || "";

  const out: Record<string, unknown> = {
    serviceAccountEmail: creds.email || "(NOT SET)",
    ga4PropertyId: creds.ga4PropertyId || "(NOT SET)",
    gscSiteUrl: creds.gscSiteUrl || "(NOT SET)",
    // Where each value is coming from, so you can see the DB override working.
    sources: {
      usedEmail: creds.email || "(NOT SET)",
      databaseEmail: (await dbEmail()) || "(not in secure_config)",
      bakedOrCloudflareEmail: gEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") || "(NOT SET)",
    },
    privateKey: key
      ? { present: true, length: key.length, startsWith: key.slice(0, 30), endsWith: key.slice(-26) }
      : { present: false },
  };

  try {
    const token = await getAccessToken();
    if (!token) {
      out.auth = "Not configured (missing email or key)";
    } else {
      out.auth = "✅ Token minted — Google authentication works";
      const prop = creds.ga4PropertyId;
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

/** Peek at just the email stored in secure_config (for the diagnostic view). */
async function dbEmail(): Promise<string | null> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    if (!admin) return null;
    const { data } = await admin.from("secure_config").select("value").eq("key", "google").maybeSingle();
    const v = (data?.value as Record<string, unknown> | undefined)?.email;
    return typeof v === "string" ? v : null;
  } catch {
    return null;
  }
}
