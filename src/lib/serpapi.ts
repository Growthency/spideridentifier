import { siteConfig } from "@/lib/site";

/**
 * SerpApi helpers for the Rank Tracker. Primary + optional backup key
 * (two free accounts = 500 searches / 30 days). Never hardcode keys.
 */

const SERPAPI_KEYS = [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_BACKUP].filter(Boolean) as string[];

export const serpApiConfigured = SERPAPI_KEYS.length > 0;

export interface SerpQuota {
  configured: boolean;
  searches_left: number;
  total: number;
}

export async function getSerpQuota(): Promise<SerpQuota> {
  const out: { left: number; total: number }[] = [];
  for (const key of SERPAPI_KEYS) {
    try {
      const res = await fetch(`https://serpapi.com/account.json?api_key=${key}`, { cache: "no-store" });
      const j = await res.json();
      out.push({
        left: j.total_searches_left ?? j.plan_searches_left ?? 0,
        total: j.searches_per_month ?? 250,
      });
    } catch {
      // unreadable key — skip
    }
  }
  return {
    configured: serpApiConfigured,
    searches_left: out.reduce((s, k) => s + k.left, 0),
    total: out.reduce((s, k) => s + k.total, 0),
  };
}

/** Where does our site rank in Google's top 100 for this keyword? */
export async function serpSearch(keyword: string): Promise<{ position: number | null; url: string | null }> {
  const host = new URL(siteConfig.url).hostname.replace(/^www\./, "");
  let lastErr = "No SerpApi key configured";
  for (const key of SERPAPI_KEYS) {
    const params = new URLSearchParams({
      engine: "google",
      q: keyword,
      num: "100",
      gl: "us",
      hl: "en",
      api_key: key,
    });
    const res = await fetch(`https://serpapi.com/search.json?${params}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || json.error) {
      lastErr = json.error || `SerpApi ${res.status}`;
      // quota exhausted → fall through to the backup key
      if (/run out of searches|quota/i.test(lastErr)) continue;
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
