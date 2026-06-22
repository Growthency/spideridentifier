import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBlogPosts, getSpecies } from "@/lib/data";
import { siteConfig } from "@/lib/site";
import { gscConfigured, gscInspectUrl, indexingPublish, gscSubmitSitemap } from "@/lib/google";

export const maxDuration = 60;

/** Random hex string via WebCrypto — works on Node and Cloudflare Workers. */
function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface IndexRow {
  url: string;
  coverage_state: string | null;
  verdict: string | null;
  last_crawl_time: string | null;
  checked_at: string | null;
  index_requested_at: string | null;
  indexnow_requested_at: string | null;
  published_at: string | null;
}

export interface IndexingScan {
  scanned_at: string | null;
  rows: IndexRow[];
}

const STATIC_ROUTES = ["", "/species", "/anatomy", "/blog", "/pricing", "/about", "/contact", "/privacy", "/terms", "/refund", "/disclaimer"];

async function allUrls(): Promise<{ url: string; published_at: string | null }[]> {
  const [posts, species] = await Promise.all([getBlogPosts(), getSpecies()]);
  return [
    ...STATIC_ROUTES.map((p) => ({ url: `${siteConfig.url}${p}`, published_at: null })),
    ...posts.map((p) => ({ url: `${siteConfig.url}/${p.slug}`, published_at: p.published_at })),
    ...species.map((s) => ({ url: `${siteConfig.url}/species/${s.slug}`, published_at: null })),
  ];
}

async function loadScan(): Promise<IndexingScan> {
  const admin = createAdminClient();
  if (!admin) return { scanned_at: null, rows: [] };
  const { data } = await admin.from("site_content").select("value").eq("key", "indexing_scan").maybeSingle();
  return (data?.value as IndexingScan) ?? { scanned_at: null, rows: [] };
}

async function saveScan(scan: IndexingScan) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin
    .from("site_content")
    .upsert({ key: "indexing_scan", value: scan, updated_at: new Date().toISOString() });
}

async function getIndexNowKey(): Promise<string> {
  const admin = createAdminClient();
  if (!admin) throw new Error("Not configured");
  const { data } = await admin.from("site_content").select("value").eq("key", "indexnow_key").maybeSingle();
  let key = (data?.value as string) || "";
  if (!key) {
    key = randomHex(16);
    await admin
      .from("site_content")
      .upsert({ key: "indexnow_key", value: key, updated_at: new Date().toISOString() });
  }
  return key;
}

/** Translate raw Google API errors into a clear next step for the admin. */
function friendlyGoogleError(message: string): string {
  if (/has not been used in project|is disabled/i.test(message)) {
    return "Enable the “Google Search Console API” for your project in Google Cloud Console, then run the scan again.";
  }
  if (/PERMISSION_DENIED|do not own|insufficient permission/i.test(message)) {
    return "The service account cannot access this Search Console property yet — run the scan again (access is granted automatically), or add the service-account email as an owner in Search Console → Settings → Users.";
  }
  if (/quota|RESOURCE_EXHAUSTED|429/i.test(message)) {
    return "Google's daily URL-inspection quota is used up — try again tomorrow.";
  }
  return message;
}

/** Merge fresh URL list with stored scan rows so timestamps survive. */
function mergeRows(urls: { url: string; published_at: string | null }[], prev: IndexRow[]): IndexRow[] {
  const prevMap = new Map(prev.map((r) => [r.url, r]));
  return urls.map(({ url, published_at }) => ({
    url,
    coverage_state: prevMap.get(url)?.coverage_state ?? null,
    verdict: prevMap.get(url)?.verdict ?? null,
    last_crawl_time: prevMap.get(url)?.last_crawl_time ?? null,
    checked_at: prevMap.get(url)?.checked_at ?? null,
    index_requested_at: prevMap.get(url)?.index_requested_at ?? null,
    indexnow_requested_at: prevMap.get(url)?.indexnow_requested_at ?? null,
    published_at,
  }));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const action = String(body.action || "");
    const now = new Date().toISOString();

    if (action === "get") {
      const [urls, scan] = await Promise.all([allUrls(), loadScan()]);
      return NextResponse.json({
        scanned_at: scan.scanned_at,
        rows: mergeRows(urls, scan.rows),
        gscConfigured,
      });
    }

    // One small batch of URL inspections — the client loops these so it can
    // draw a live progress bar; results persist after every batch.
    if (action === "scan-batch") {
      if (!gscConfigured) return NextResponse.json({ error: "Search Console not configured" }, { status: 503 });
      const urls: string[] = (body.urls ?? []).slice(0, 10);
      if (!urls.length || urls.some((u) => typeof u !== "string" || !u.startsWith(siteConfig.url))) {
        return NextResponse.json({ error: "Invalid URLs" }, { status: 400 });
      }
      const results: { url: string; coverage_state?: string; verdict?: string; last_crawl_time?: string | null; checked_at?: string; error?: string }[] = [];
      await Promise.all(
        urls.map(async (url) => {
          const r = await gscInspectUrl(url);
          if (r.ok && r.result) {
            results.push({
              url,
              coverage_state: r.result.coverageState,
              verdict: r.result.verdict,
              last_crawl_time: r.result.lastCrawlTime ?? null,
              checked_at: now,
            });
          } else if (!r.ok) {
            results.push({ url, error: friendlyGoogleError(r.error) });
          } else {
            results.push({ url });
          }
        })
      );
      const scan = await loadScan();
      for (const res of results) {
        if (!res.checked_at) continue;
        let row = scan.rows.find((r) => r.url === res.url);
        if (!row) {
          row = { url: res.url, coverage_state: null, verdict: null, last_crawl_time: null, checked_at: null, index_requested_at: null, indexnow_requested_at: null, published_at: null };
          scan.rows.push(row);
        }
        row.coverage_state = res.coverage_state ?? null;
        row.verdict = res.verdict ?? null;
        row.last_crawl_time = res.last_crawl_time ?? null;
        row.checked_at = now;
      }
      await saveScan(scan);
      return NextResponse.json({ results });
    }

    if (action === "scan-finish") {
      const scan = await loadScan();
      scan.scanned_at = now;
      await saveScan(scan);
      return NextResponse.json({ scanned_at: now });
    }

    if (action === "scan") {
      if (!gscConfigured) return NextResponse.json({ error: "Search Console not configured" }, { status: 503 });
      const [urls, prev] = await Promise.all([allUrls(), loadScan()]);
      const rows = mergeRows(urls, prev.rows);
      const errors: string[] = [];
      // Inspect in small parallel batches — quota is 600/min, we have ~30 URLs.
      const BATCH = 5;
      for (let i = 0; i < rows.length; i += BATCH) {
        await Promise.all(
          rows.slice(i, i + BATCH).map(async (row) => {
            const r = await gscInspectUrl(row.url);
            if (r.ok && r.result) {
              row.coverage_state = r.result.coverageState;
              row.verdict = r.result.verdict;
              row.last_crawl_time = r.result.lastCrawlTime ?? null;
              row.checked_at = now;
            } else if (!r.ok) {
              errors.push(r.error);
            }
          })
        );
      }
      const checkedNow = rows.filter((r) => r.checked_at === now).length;
      // Every inspection failed — report the cause instead of saving an empty scan.
      if (checkedNow === 0 && errors.length > 0) {
        return NextResponse.json({ error: friendlyGoogleError(errors[0]) }, { status: 502 });
      }
      const scan: IndexingScan = { scanned_at: now, rows };
      await saveScan(scan);
      return NextResponse.json({
        scanned_at: now,
        rows,
        gscConfigured,
        warning: errors.length > 0 ? `${errors.length} URL${errors.length > 1 ? "s" : ""} could not be inspected — ${friendlyGoogleError(errors[0])}` : undefined,
      });
    }

    if (action === "request-index" || action === "bulk-request") {
      const urls: string[] = action === "request-index" ? [body.url] : (body.urls ?? []).slice(0, 50);
      if (!urls.length || urls.some((u) => typeof u !== "string" || !u.startsWith(siteConfig.url))) {
        return NextResponse.json({ error: "Invalid URLs" }, { status: 400 });
      }
      const results: Record<string, string | null> = {};
      for (const url of urls) {
        const r = await indexingPublish(url);
        results[url] = r.ok ? null : (r.error ?? "failed");
      }
      // stamp request times on stored rows
      const scan = await loadScan();
      for (const row of scan.rows) {
        if (urls.includes(row.url) && results[row.url] === null) row.index_requested_at = now;
      }
      await saveScan(scan);
      const failed = Object.values(results).filter(Boolean).length;
      return NextResponse.json({ ok: failed === 0, failed, results });
    }

    if (action === "indexnow") {
      const urls: string[] = (body.urls ?? []).slice(0, 500);
      if (!urls.length || urls.some((u) => typeof u !== "string" || !u.startsWith(siteConfig.url))) {
        return NextResponse.json({ error: "Invalid URLs" }, { status: 400 });
      }
      const key = await getIndexNowKey();
      const host = new URL(siteConfig.url).hostname;
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host,
          key,
          keyLocation: `${siteConfig.url}/indexnow-key.txt`,
          urlList: urls,
        }),
      });
      const ok = res.ok || res.status === 202;
      if (ok) {
        const scan = await loadScan();
        for (const row of scan.rows) {
          if (urls.includes(row.url)) row.indexnow_requested_at = now;
        }
        await saveScan(scan);
      }
      return NextResponse.json({ ok, status: res.status });
    }

    if (action === "submit-sitemap") {
      const r = await gscSubmitSitemap(`${siteConfig.url}/sitemap.xml`);
      return NextResponse.json(r, { status: r.ok ? 200 : 502 });
    }

    if (action === "submit-feed") {
      const r = await gscSubmitSitemap(`${siteConfig.url}/feed.xml`);
      return NextResponse.json(r, { status: r.ok ? 200 : 502 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 500 });
  }
}
