/**
 * Minimal Google service-account client for GA4 (Analytics Data API) and
 * Search Console — plain REST + a self-signed JWT, no extra dependencies.
 *
 * Required env (see .env.example):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  service account email
 *   GOOGLE_PRIVATE_KEY            the account's private key (\n-escaped ok)
 *   GA4_PROPERTY_ID               numeric GA4 property id
 *   GSC_SITE_URL                  verified property, e.g. https://example.com/
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Read an env var preferring the LIVE Cloudflare binding (dashboard Secret/Var)
 * over the value baked into the bundle at build time. OpenNext inlines .env
 * into the build, so process.env can be a STALE snapshot; the Cloudflare
 * runtime binding always reflects what the dashboard has right now. Falls back
 * to process.env during local dev / build (no Cloudflare request context).
 */
export function gEnv(name: string): string | undefined {
  try {
    const v = (getCloudflareContext().env as Record<string, unknown>)[name];
    if (typeof v === "string" && v) return v;
  } catch {
    // not inside a Cloudflare request context — use the local/build value
  }
  return process.env[name];
}

export interface GoogleCreds {
  email?: string;
  privateKey?: string;
  ga4PropertyId?: string;
  gscSiteUrl?: string;
}

let cachedCreds: GoogleCreds | null = null;

/**
 * Google credentials, read from the Supabase `secure_config` table (key
 * "google") FIRST, then env vars as a fallback. The database copy is fetched
 * at runtime and is never baked into the build, so changing it takes effect
 * immediately with no redeploy — the reliable path on Cloudflare. The table is
 * RLS-locked to the service role, so the public anon key cannot read it.
 */
export async function loadGoogleCreds(force = false): Promise<GoogleCreds> {
  if (cachedCreds && !force) return cachedCreds;
  let db: Record<string, unknown> = {};
  try {
    const admin = createAdminClient();
    if (admin) {
      const { data } = await admin.from("secure_config").select("value").eq("key", "google").maybeSingle();
      if (data?.value && typeof data.value === "object") db = data.value as Record<string, unknown>;
    }
  } catch {
    // table not installed yet / unreachable — fall back to env
  }
  const pick = (dbKey: string, envKey: string): string | undefined => {
    const v = db[dbKey];
    if (typeof v === "string" && v.trim()) return v.trim();
    return gEnv(envKey)?.trim();
  };
  cachedCreds = {
    email: pick("email", "GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    privateKey: pick("private_key", "GOOGLE_PRIVATE_KEY"),
    ga4PropertyId: pick("ga4_property_id", "GA4_PROPERTY_ID"),
    gscSiteUrl: pick("gsc_site_url", "GSC_SITE_URL"),
  };
  return cachedCreds;
}

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters",
  "https://www.googleapis.com/auth/indexing",
].join(" ");

export const googleConfigured = Boolean(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
);
export const ga4Configured = googleConfigured && Boolean(process.env.GA4_PROPERTY_ID);
export const gscConfigured = googleConfigured && Boolean(process.env.GSC_SITE_URL);

/** Property id exactly as Search Console expects (URL-prefix needs the trailing slash). */
async function gscSite(): Promise<string> {
  let s = ((await loadGoogleCreds()).gscSiteUrl ?? "").trim();
  if (/^https?:\/\//i.test(s) && !s.endsWith("/")) s += "/";
  return s;
}

function b64url(input: string | Uint8Array): string {
  const buf = typeof input === "string" ? Buffer.from(input) : Buffer.from(input);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** PEM (PKCS#8) private key → ArrayBuffer for WebCrypto importKey. */
function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

let cachedToken: { token: string; exp: number } | null = null;

/**
 * OAuth2 access token from a service-account JWT, signed with WebCrypto so it
 * behaves identically on Node and the Cloudflare Workers runtime (the legacy
 * node:crypto `createSign` is unreliable on Workers). Cached until ~5 min
 * before expiry.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!googleConfigured) return null;
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 300 > now) return cachedToken.token;

  // Credentials come from the DB (secure_config) first, env as fallback —
  // trimmed so a stray space/newline can't corrupt the JWT (a bad iss surfaces
  // as the cryptic "invalid_grant: account not found").
  const creds = await loadGoogleCreds();
  const email = creds.email;
  if (!email) throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is not set");

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: email,
      scope: SCOPES,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${claims}`;

  if (!creds.privateKey) throw new Error("GOOGLE_PRIVATE_KEY is not set");
  const pem = creds.privateKey.replace(/\\n/g, "\n").trim();
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput));
  const assertion = `${signingInput}.${b64url(new Uint8Array(sigBuf))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google auth failed: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, exp: now + json.expires_in };
  return json.access_token;
}

async function googleFetch<T>(url: string, body?: unknown): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error("Google not configured");
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`Google API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<T>;
}

/* ── GA4 (Analytics Data API v1beta) ─────────────────────────────────────── */

interface Ga4Row {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}
interface Ga4Response {
  rows?: Ga4Row[];
}

export async function ga4RunReport(report: {
  dateRanges: { startDate: string; endDate: string }[];
  metrics: { name: string }[];
  dimensions?: { name: string }[];
  orderBys?: unknown[];
  limit?: number;
}): Promise<Ga4Row[]> {
  if (!ga4Configured) return [];
  const data = await googleFetch<Ga4Response>(
    `https://analyticsdata.googleapis.com/v1beta/properties/${(await loadGoogleCreds()).ga4PropertyId}:runReport`,
    report
  );
  return data.rows ?? [];
}

export interface AnalyticsSummary {
  users30d: number;
  users7d: number;
  usersToday: number;
  newUsers30d: number;
  sessions30d: number;
  pageViews30d: number;
  daily: { date: string; users: number }[];
  topPages: { path: string; title: string; views: number }[];
  topCountries: { country: string; users: number }[];
}

const n = (row: Ga4Row | undefined, i = 0) => Number(row?.metricValues?.[i]?.value ?? 0);

/** Everything the admin dashboard shows, in four GA4 calls. */
export async function getAnalyticsSummary(
  startDate = "30daysAgo",
  endDate = "today"
): Promise<AnalyticsSummary | null> {
  if (!ga4Configured) return null;
  const range = { startDate, endDate };

  const [totals, daily, pages, countries] = await Promise.all([
    // one row of headline metrics per range
    Promise.all([
      ga4RunReport({ dateRanges: [range], metrics: [{ name: "totalUsers" }, { name: "newUsers" }, { name: "sessions" }, { name: "screenPageViews" }] }),
      ga4RunReport({ dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], metrics: [{ name: "totalUsers" }] }),
      ga4RunReport({ dateRanges: [{ startDate: "today", endDate: "today" }], metrics: [{ name: "totalUsers" }] }),
    ]),
    ga4RunReport({
      dateRanges: [range],
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "date" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    ga4RunReport({
      dateRanges: [range],
      metrics: [{ name: "screenPageViews" }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 25,
    }),
    ga4RunReport({
      dateRanges: [range],
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "country" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 25,
    }),
  ]);

  const [main, week, today] = totals;
  return {
    users30d: n(main[0], 0),
    newUsers30d: n(main[0], 1),
    sessions30d: n(main[0], 2),
    pageViews30d: n(main[0], 3),
    users7d: n(week[0]),
    usersToday: n(today[0]),
    daily: daily.map((r) => ({ date: r.dimensionValues?.[0]?.value ?? "", users: n(r) })),
    topPages: pages.map((r) => ({
      path: r.dimensionValues?.[0]?.value ?? "",
      title: r.dimensionValues?.[1]?.value ?? "",
      views: n(r),
    })),
    topCountries: countries.map((r) => ({ country: r.dimensionValues?.[0]?.value ?? "", users: n(r) })),
  };
}

/* ── Search Console ──────────────────────────────────────────────────────── */

let triedSiteAdd = false;

/**
 * The service account needs the property in its own Search Console site list.
 * A verified owner (Site Verification API) may self-register via sites.add —
 * so on the first 403 we register once and retry the call.
 */
async function withGscAccess<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (triedSiteAdd || !/403/.test(msg)) throw e;
    triedSiteAdd = true;
    try {
      const token = await getAccessToken();
      await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(await gscSite())}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // registration failed — the retry below surfaces the real error
    }
    return call();
  }
}

export interface GscRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function gscSearchAnalytics(body: {
  startDate: string;
  endDate: string;
  dimensions: string[];
  rowLimit?: number;
  dimensionFilterGroups?: unknown[];
}): Promise<GscRow[]> {
  if (!gscConfigured) return [];
  const site = encodeURIComponent(await gscSite());
  const data = await withGscAccess(() =>
    googleFetch<{ rows?: GscRow[] }>(
      `https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`,
      body
    )
  );
  return data.rows ?? [];
}

export interface UrlInspection {
  verdict: string;
  coverageState: string;
  lastCrawlTime?: string;
  googleCanonical?: string;
}

/** Google Indexing API — ask Google to (re)crawl a URL. */
export async function indexingPublish(url: string): Promise<{ ok: boolean; error?: string }> {
  if (!googleConfigured) return { ok: false, error: "Google not configured" };
  try {
    await googleFetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      url,
      type: "URL_UPDATED",
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}

/** Submit a sitemap (or RSS feed) to Search Console. */
export async function gscSubmitSitemap(feedUrl: string): Promise<{ ok: boolean; error?: string }> {
  if (!gscConfigured) return { ok: false, error: "Search Console not configured" };
  try {
    const site = encodeURIComponent(await gscSite());
    await withGscAccess(async () => {
      const token = await getAccessToken();
      const res = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps/${encodeURIComponent(feedUrl)}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Sitemap submit ${res.status}: ${(await res.text()).slice(0, 200)}`);
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}

export type InspectionResult = { ok: true; result: UrlInspection | null } | { ok: false; error: string };

/** URL Inspection API — index status for a single URL. */
export async function gscInspectUrl(url: string): Promise<InspectionResult> {
  if (!gscConfigured) return { ok: false, error: "Search Console not configured" };
  try {
    const site = await gscSite();
    const data = await withGscAccess(() =>
      googleFetch<{
        inspectionResult?: {
          indexStatusResult?: {
            verdict?: string;
            coverageState?: string;
            lastCrawlTime?: string;
            googleCanonical?: string;
          };
        };
      }>("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
        inspectionUrl: url,
        siteUrl: site,
      })
    );
    const r = data.inspectionResult?.indexStatusResult;
    if (!r) return { ok: true, result: null };
    return {
      ok: true,
      result: {
        verdict: r.verdict ?? "VERDICT_UNSPECIFIED",
        coverageState: r.coverageState ?? "Unknown",
        lastCrawlTime: r.lastCrawlTime,
        googleCanonical: r.googleCanonical,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Inspection failed" };
  }
}
