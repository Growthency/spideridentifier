import { siteConfig } from "@/lib/site";

/**
 * SerpApi helpers for the Rank Tracker. Primary + optional backup key
 * (two free accounts = 500 searches / 30 days). Never hardcode keys.
 */

const SERPAPI_KEYS = [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_BACKUP].filter(Boolean) as string[];

export const serpApiConfigured = SERPAPI_KEYS.length > 0;

export interface SerpQuota {
  configured: boolean;
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  planName: string | null;
  /** How many SerpApi keys actually loaded (1 = primary only, 2 = + backup). */
  keyCount: number;
}

const ROLLING_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;

/** Next quota-reset moment for one account (explicit field → signup anchor → +30d). */
function computeResetAt(acc: Record<string, unknown> | null, anchorOverride?: string): string {
  const explicit = [acc?.next_billing_at, acc?.subscription_renewed_at, acc?.reset_at, acc?.plan_next_reset_at, acc?.next_reset_at];
  for (const c of explicit) {
    if (typeof c === "string" && !isNaN(Date.parse(c))) return new Date(c).toISOString();
    if (typeof c === "number" && c > 0) return new Date(c < 1e12 ? c * 1000 : c).toISOString();
  }
  const anchors = [acc?.account_created_at, acc?.created_at, acc?.plan_subscription_started_at, anchorOverride];
  for (const c of anchors) {
    if (typeof c === "string" && !isNaN(Date.parse(c))) {
      const created = new Date(c).getTime();
      const cycles = Math.floor(Math.max(0, Date.now() - created) / ROLLING_CYCLE_MS);
      return new Date(created + (cycles + 1) * ROLLING_CYCLE_MS).toISOString();
    }
  }
  return new Date(Date.now() + ROLLING_CYCLE_MS).toISOString();
}

/** Pooled quota across every configured key — one "X / 500 used" number. */
export async function getSerpQuota(): Promise<SerpQuota> {
  const anchors = [process.env.SERPAPI_ACCOUNT_CREATED_AT, process.env.SERPAPI_ACCOUNT_CREATED_AT_BACKUP];
  let used = 0,
    limit = 0,
    remaining = 0,
    keyCount = 0;
  let earliest: number | null = null;
  let planName: string | null = null;

  for (let i = 0; i < SERPAPI_KEYS.length; i++) {
    try {
      const res = await fetch(`https://serpapi.com/account.json?api_key=${SERPAPI_KEYS[i]}`, { cache: "no-store" });
      const acc = await res.json();
      if (acc?.total_searches_left === undefined && acc?.searches_per_month === undefined) continue;
      const lim = acc.searches_per_month || 250;
      const planLeft = acc.plan_searches_left ?? acc.total_searches_left ?? lim;
      const totalLeft = acc.total_searches_left ?? planLeft;
      keyCount += 1;
      used += Math.max(0, lim - planLeft);
      limit += lim;
      remaining += totalLeft;
      planName = planName || acc.plan_name || acc.plan_id || null;
      const ts = new Date(computeResetAt(acc, anchors[i])).getTime();
      if (earliest === null || ts < earliest) earliest = ts;
    } catch {
      // unreadable key — skip
    }
  }

  return {
    configured: serpApiConfigured,
    used,
    limit: limit || 250,
    remaining,
    resetAt: earliest ? new Date(earliest).toISOString() : computeResetAt(null),
    planName,
    keyCount,
  };
}

/** Where does our site rank in Google's top 100 for this keyword? (1 credit) */
export async function serpSearch(keyword: string): Promise<{ position: number | null; url: string | null }> {
  const host = new URL(siteConfig.url).hostname.replace(/^www\./, "");
  let lastErr = "No SerpApi key configured";
  for (const key of SERPAPI_KEYS) {
    const params = new URLSearchParams({ engine: "google", q: keyword, num: "100", gl: "us", hl: "en", api_key: key });
    const res = await fetch(`https://serpapi.com/search.json?${params}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || json.error) {
      lastErr = json.error || `SerpApi ${res.status}`;
      if (/run out of searches|quota|exceeded|monthly\s+limit/i.test(lastErr)) continue; // failover
      throw new Error(lastErr);
    }
    const organic: { position: number; link: string }[] = json.organic_results ?? [];
    const hit = organic.find((r) => {
      try {
        return new URL(r.link).hostname.replace(/^www\./, "").endsWith(host);
      } catch {
        return false;
      }
    });
    return { position: hit?.position ?? null, url: hit?.link ?? null };
  }
  throw new Error(lastErr);
}
