"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  ExternalLink,
  Clock,
  FileSearch,
  ArrowUpRight,
  Sparkles,
  Shield,
  Zap,
  Radio,
  Rss,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ArrowUpDown,
} from "lucide-react";

interface IndexRow {
  url: string;
  coverage_state: string | null;
  verdict: string | null;
  last_crawl_time: string | null;
  checked_at: string | null;
  index_requested_at: string | null;
  indexnow_requested_at: string | null;
  published_at: string | null;
}

const PER_PAGE = 100;
const INDEXED_STATES = ["Submitted and indexed", "Indexed, not submitted in sitemap"];
const isIndexed = (r: IndexRow) => r.verdict === "PASS" || INDEXED_STATES.includes(r.coverage_state ?? "");

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function pathOf(url: string): string {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}
function publishedAgo(iso: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return "Published today";
  if (days === 1) return "Published 1 day ago";
  return `Published ${days} days ago`;
}

/* ── Donut ── */
function DonutChart({ indexed, total }: { indexed: number; total: number }) {
  const pct = total > 0 ? (indexed / total) * 100 : 0;
  const r = 58;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" className="stroke-foreground/[0.06]" strokeWidth="14" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f87171" strokeWidth="14" strokeDasharray={`${circ} ${circ}`} transform="rotate(-90 70 70)" strokeLinecap="round" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray={`${(pct / 100) * circ} ${circ}`} transform="rotate(-90 70 70)" strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-emerald-500">{pct.toFixed(1)}%</span>
        <span className="mt-0.5 text-xs font-medium text-foreground/45">Indexed</span>
      </div>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-foreground/8 bg-card p-4 sm:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: color + "14" }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) for (let i = 1; i <= totalPages; i++) pages.push(i);
  else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  const btn = "grid h-8 w-8 place-items-center rounded-lg text-xs font-medium transition-colors";
  return (
    <div className="mt-4 flex items-center justify-center gap-1.5">
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className={`${btn} text-foreground/55 disabled:opacity-30`}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`d${i}`} className="w-8 text-center text-xs text-foreground/40">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)} className={`${btn} ${p === page ? "bg-emerald-500 font-bold text-white" : "text-foreground/55 hover:bg-foreground/5"}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={`${btn} text-foreground/55 disabled:opacity-30`}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function IndexingReportPage() {
  const [rows, setRows] = useState<IndexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ done: 0, total: 0 });
  const [requestingUrl, setRequestingUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [indexedPage, setIndexedPage] = useState(1);
  const [notIndexedPage, setNotIndexedPage] = useState(1);
  const [notIndexedSort, setNotIndexedSort] = useState<"none" | "oldest" | "newest">("none");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [gsc, setGsc] = useState(true);
  const [scanError, setScanError] = useState("");
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [indexNowLoading, setIndexNowLoading] = useState(false);
  const [indexNowResult, setIndexNowResult] = useState<{ ok: boolean; status: number } | null>(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean } | null>(null);
  const [toolsExpanded, setToolsExpanded] = useState(true);

  const api = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/indexing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, json: await res.json() };
  }, []);

  const fetchResults = useCallback(async () => {
    const { ok, json } = await api({ action: "get" });
    if (ok) {
      setRows(json.rows ?? []);
      setLastScan(json.scanned_at ?? null);
      setGsc(Boolean(json.gscConfigured));
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const copyNotIndexedUrls = async () => {
    const urls = rows.filter((r) => !isIndexed(r)).map((r) => r.url);
    await navigator.clipboard.writeText(urls.join("\n"));
    setCopied(true);
    showToast(`${urls.length} URLs copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyByCoverageState = async (state: string) => {
    const urls = rows.filter((r) => (r.coverage_state || "Unknown") === state).map((r) => r.url);
    if (!urls.length) return showToast("No URLs in this group");
    await navigator.clipboard.writeText(urls.join("\n"));
    setCopiedState(state);
    showToast(`${urls.length} "${state}" URL${urls.length === 1 ? "" : "s"} copied`);
    setTimeout(() => setCopiedState((s) => (s === state ? null : s)), 2000);
  };

  const runScan = async () => {
    setScanning(true);
    setScanError("");
    const next = rows.map((r) => ({ ...r }));
    const urls = next.map((r) => r.url);
    setScanProgress({ done: 0, total: urls.length });
    for (let i = 0; i < urls.length; i += 5) {
      const { ok, json } = await api({ action: "scan-batch", urls: urls.slice(i, i + 5) });
      if (!ok) {
        setScanError(json.error || "Scan failed");
        break;
      }
      for (const res of json.results ?? []) {
        if (res.error) continue;
        const idx = next.findIndex((r) => r.url === res.url);
        if (idx >= 0 && res.checked_at) next[idx] = { ...next[idx], coverage_state: res.coverage_state ?? null, verdict: res.verdict ?? null, last_crawl_time: res.last_crawl_time ?? null, checked_at: res.checked_at };
      }
      setRows(next.map((r) => ({ ...r })));
      setScanProgress({ done: Math.min(urls.length, i + 5), total: urls.length });
    }
    const fin = await api({ action: "scan-finish" });
    if (fin.ok) setLastScan(fin.json.scanned_at ?? null);
    setScanning(false);
  };

  const requestIndex = async (url: string) => {
    setRequestingUrl(url);
    const { json } = await api({ action: "request-index", url });
    showToast(json.ok ? `Indexing requested: ${pathOf(url)}` : `Failed: ${json.error || json.results?.[url] || "error"}`);
    if (json.ok) await fetchResults();
    setRequestingUrl(null);
  };

  const bulkRequestNotIndexed = async () => {
    const urls = rows.filter((r) => !isIndexed(r)).map((r) => r.url);
    if (!urls.length) return;
    setRequestingUrl("__bulk__");
    setScanProgress({ done: 0, total: urls.length });
    let sent = 0,
      failed = 0;
    for (let i = 0; i < urls.length; i += 10) {
      const { json } = await api({ action: "bulk-request", urls: urls.slice(i, i + 10) });
      const batchFailed = json.failed ?? 0;
      failed += batchFailed;
      sent += urls.slice(i, i + 10).length - batchFailed;
      setScanProgress({ done: Math.min(i + 10, urls.length), total: urls.length });
    }
    showToast(`Bulk complete: ${sent} sent, ${failed} failed`);
    setScanProgress({ done: 0, total: 0 });
    await fetchResults();
    setRequestingUrl(null);
  };

  const submitIndexNow = async () => {
    const urls = rows.filter((r) => !isIndexed(r)).map((r) => r.url);
    if (!urls.length) return showToast("All pages are already indexed!");
    setIndexNowLoading(true);
    setIndexNowResult(null);
    const { json } = await api({ action: "indexnow", urls });
    setIndexNowResult({ ok: Boolean(json.ok), status: json.status ?? 0 });
    showToast(json.ok ? `IndexNow: ${urls.length} not-indexed URLs submitted` : "IndexNow failed");
    setIndexNowLoading(false);
  };

  const submitSingleIndexNow = async (url: string) => {
    setRequestingUrl(`indexnow-${url}`);
    const { json } = await api({ action: "indexnow", urls: [url] });
    showToast(json.ok ? `IndexNow sent: ${pathOf(url)}` : "IndexNow failed");
    if (json.ok) await fetchResults();
    setRequestingUrl(null);
  };

  const submitSitemap = async () => {
    setPingLoading(true);
    setPingResult(null);
    const { json } = await api({ action: "submit-sitemap" });
    setPingResult({ ok: Boolean(json.ok) });
    showToast(json.ok ? "Sitemap submitted to Search Console" : `Sitemap failed: ${json.error || ""}`);
    setPingLoading(false);
  };

  /* derived */
  const checked = rows.filter((r) => r.checked_at);
  const indexedAll = rows.filter(isIndexed);
  const filterFn = (r: IndexRow) => (searchQuery ? pathOf(r.url).toLowerCase().includes(searchQuery.toLowerCase()) : true);
  const indexed = useMemo(() => indexedAll.filter(filterFn), [rows, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps
  const notIndexed = useMemo(() => checked.filter((r) => !isIndexed(r)).filter(filterFn), [rows, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const notIndexedSorted = useMemo(() => {
    if (notIndexedSort === "none") return notIndexed;
    const withDate = notIndexed.filter((r) => r.published_at);
    const noDate = notIndexed.filter((r) => !r.published_at);
    withDate.sort((a, b) => {
      const ta = new Date(a.published_at as string).getTime();
      const tb = new Date(b.published_at as string).getTime();
      return notIndexedSort === "oldest" ? ta - tb : tb - ta;
    });
    return [...withDate, ...noDate];
  }, [notIndexed, notIndexedSort]);

  const cycleSort = () => {
    setNotIndexedSort((s) => (s === "none" ? "oldest" : s === "oldest" ? "newest" : "none"));
    setNotIndexedPage(1);
  };

  const indexedTotalPages = Math.ceil(indexed.length / PER_PAGE) || 1;
  const notIndexedTotalPages = Math.ceil(notIndexedSorted.length / PER_PAGE) || 1;
  const indexedSlice = indexed.slice((indexedPage - 1) * PER_PAGE, indexedPage * PER_PAGE);
  const notIndexedSlice = notIndexedSorted.slice((notIndexedPage - 1) * PER_PAGE, notIndexedPage * PER_PAGE);

  const totalUrls = rows.length;
  const indexRate = checked.length > 0 ? Math.round((indexedAll.length / checked.length) * 1000) / 10 : 0;
  const notIndexedCount = checked.length - indexedAll.length;

  const coverage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of checked) counts.set(r.coverage_state || "Unknown", (counts.get(r.coverage_state || "Unknown") ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const tile = "rounded-2xl border border-foreground/8 bg-card";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 shadow-2xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/12">
            <Globe className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-foreground">Indexing Report</h1>
            <p className="text-xs text-foreground/55">Monitor &amp; manage your Google search index</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastScan && (
            <span className="flex items-center gap-1.5 text-xs text-foreground/55">
              <Clock className="h-3.5 w-3.5" /> Last scan: {timeAgo(lastScan)}
            </span>
          )}
          <button
            onClick={runScan}
            disabled={scanning || !gsc}
            title={gsc ? "Inspect every URL with Search Console" : "Connect Search Console first"}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {scanning ? "Scanning…" : "Run Scan"}
          </button>
        </div>
      </div>

      {/* Scan progress */}
      {scanning && scanProgress.total > 0 && (
        <div className={`${tile} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Checking URLs… {scanProgress.done} / {scanProgress.total}</span>
            <span className="text-xs font-bold text-emerald-500">{Math.round((scanProgress.done / scanProgress.total) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(scanProgress.done / scanProgress.total) * 100}%`, background: "linear-gradient(90deg,#10b981,#34d399)" }} />
          </div>
        </div>
      )}

      {/* Bulk progress */}
      {requestingUrl === "__bulk__" && scanProgress.total > 0 && (
        <div className={`${tile} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Requesting indexing… {scanProgress.done} / {scanProgress.total}</span>
            <span className="text-xs font-bold text-blue-500">{Math.round((scanProgress.done / scanProgress.total) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(scanProgress.done / scanProgress.total) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
          </div>
        </div>
      )}

      {/* Scan error / connect notice */}
      {!gsc && (
        <div className={`${tile} p-8 text-center`}>
          <Globe className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Connect Search Console</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Add the Google service-account keys + <code className="text-emerald-500">GSC_SITE_URL</code> to scan your index, request indexing and submit sitemaps.
          </p>
        </div>
      )}
      {scanError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-500">Scan Error</p>
            <p className="mt-1 break-all text-xs text-foreground/55">{scanError}</p>
          </div>
        </div>
      )}

      {/* SEO Boost Tools */}
      <div className="overflow-hidden rounded-2xl border border-foreground/8">
        <button onClick={() => setToolsExpanded((o) => !o)} className="flex w-full items-center justify-between bg-violet-500/[0.06] px-5 py-4">
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
              <Zap className="h-4 w-4 text-violet-500" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-bold text-foreground">SEO Boost Tools</span>
              <span className="block text-[11px] text-foreground/55">IndexNow, Sitemap Submit, RSS Feed</span>
            </span>
          </span>
          {toolsExpanded ? <ChevronUp className="h-4 w-4 text-foreground/55" /> : <ChevronDown className="h-4 w-4 text-foreground/55" />}
        </button>

        {toolsExpanded && (
          <div className="grid grid-cols-1 bg-card md:grid-cols-3">
            {/* IndexNow */}
            <div className="flex flex-col border-foreground/8 p-5 md:border-r">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/[0.08]"><Zap className="h-4.5 w-4.5 text-blue-500" /></span>
                <div>
                  <h3 className="text-[13px] font-bold text-foreground">IndexNow</h3>
                  <p className="text-[10px] text-foreground/55">Instant crawl notification</p>
                </div>
              </div>
              <p className="mb-4 text-[11px] leading-relaxed text-foreground/55">Submit only not-indexed URLs to Bing, Yandex &amp; search engines. No daily limit.</p>
              <button onClick={submitIndexNow} disabled={indexNowLoading} className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-60" style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
                {indexNowLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                {indexNowLoading ? "Submitting…" : `Submit Not-Indexed (${notIndexedCount})`}
              </button>
              {indexNowResult && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3 py-1.5">
                  <span className="text-[11px] font-medium text-foreground">Bing / IndexNow</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: indexNowResult.ok ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: indexNowResult.ok ? "#10b981" : "#ef4444" }}>
                    {indexNowResult.ok ? "Sent" : `Error ${indexNowResult.status}`}
                  </span>
                </div>
              )}
            </div>

            {/* Sitemap Submit */}
            <div className="flex flex-col border-foreground/8 p-5 md:border-r">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/[0.08]"><Radio className="h-4.5 w-4.5 text-emerald-500" /></span>
                <div>
                  <h3 className="text-[13px] font-bold text-foreground">Sitemap Submit</h3>
                  <p className="text-[10px] text-foreground/55">Google Search Console + Bing</p>
                </div>
              </div>
              <p className="mb-4 text-[11px] leading-relaxed text-foreground/55">Submit sitemap to Google Search Console &amp; Bing. Use after publishing new content.</p>
              <button onClick={submitSitemap} disabled={pingLoading || !gsc} className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-60" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                {pingLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Radio className="h-3.5 w-3.5" />}
                {pingLoading ? "Submitting…" : "Submit Sitemap"}
              </button>
              {pingResult && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3 py-1.5">
                  <span className="text-[11px] font-medium text-foreground">Search Console</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: pingResult.ok ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: pingResult.ok ? "#10b981" : "#ef4444" }}>
                    {pingResult.ok ? "Submitted" : "Error"}
                  </span>
                </div>
              )}
            </div>

            {/* RSS Feed */}
            <div className="flex flex-col p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/[0.08]"><Rss className="h-4.5 w-4.5 text-amber-500" /></span>
                <div>
                  <h3 className="text-[13px] font-bold text-foreground">RSS Feed</h3>
                  <p className="text-[10px] text-foreground/55">Auto-discovery for crawlers</p>
                </div>
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-foreground/55">RSS feed helps search engines discover new content automatically. Active at:</p>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-foreground/8 bg-foreground/[0.03] px-3 py-2 font-mono text-[11px] text-amber-500">
                <Rss className="h-3 w-3 shrink-0" /> /feed.xml
              </div>
              <a href="/feed.xml" target="_blank" rel="noopener noreferrer" className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                <ExternalLink className="h-3.5 w-3.5" /> View RSS Feed
              </a>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-foreground/[0.03] px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px] font-medium text-emerald-500">Active — Auto-linked in {"<head>"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {checked.length === 0 && !scanning && gsc && (
        <div className={`${tile} py-16 text-center`}>
          <FileSearch className="mx-auto mb-4 h-16 w-16 text-foreground/20" />
          <h3 className="mb-2 text-lg font-bold text-foreground">No Scan Data Yet</h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-foreground/55">Run your first scan to check which pages from your sitemap are indexed by Google.</p>
          <button onClick={runScan} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
            <Sparkles className="h-4 w-4" /> Run Your First Scan
          </button>
        </div>
      )}

      {/* Stats + chart + lists */}
      {(checked.length > 0 || rows.length > 0) && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard icon={FileSearch} label="Total Pages" value={totalUrls} color="#3b82f6" />
            <StatCard icon={CheckCircle2} label="Indexed" value={indexedAll.length} color="#10b981" />
            <StatCard icon={XCircle} label="Not Indexed" value={Math.max(0, notIndexedCount)} color="#ef4444" />
            <StatCard icon={Shield} label="Index Rate" value={`${indexRate}%`} color="#f59e0b" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={`${tile} flex flex-col items-center justify-center p-6`}>
              <DonutChart indexed={indexedAll.length} total={checked.length || rows.length} />
              <div className="mt-4 flex items-center gap-6 text-xs text-foreground/55">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Indexed ({indexedAll.length})</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /> Not Indexed ({Math.max(0, notIndexedCount)})</span>
              </div>
            </div>

            <div className={`${tile} p-6`}>
              <h3 className="mb-4 text-sm font-bold text-foreground">Coverage Breakdown</h3>
              {coverage.length === 0 ? (
                <p className="py-8 text-center text-sm text-foreground/40">Run a scan to see Google&apos;s coverage states.</p>
              ) : (
                <div className="space-y-3">
                  {coverage.map(([state, count]) => {
                    const pct = checked.length > 0 ? (count / checked.length) * 100 : 0;
                    const isGreen = state.toLowerCase().includes("indexed") && !state.toLowerCase().includes("not");
                    const just = copiedState === state;
                    return (
                      <button
                        key={state}
                        onClick={() => copyByCoverageState(state)}
                        className="group -mx-2 w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-foreground/[0.03]"
                        style={{ background: just ? "rgba(16,185,129,0.08)" : undefined }}
                        title={`Click to copy all ${count} "${state}" URL${count === 1 ? "" : "s"}`}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex max-w-[200px] items-center gap-1.5 truncate text-xs text-foreground">
                            {just ? <Check className="h-3 w-3 shrink-0 text-emerald-500" /> : <Copy className="h-3 w-3 shrink-0 text-foreground/55 opacity-0 transition-opacity group-hover:opacity-50" />}
                            {state}
                          </span>
                          <span className="ml-2 shrink-0 text-xs font-bold" style={{ color: just ? "#10b981" : isGreen ? "#10b981" : "#f59e0b" }}>
                            {just ? "Copied!" : `${count} (${pct.toFixed(0)}%)`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-foreground/[0.06]">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: isGreen ? "#10b981" : "#f59e0b" }} />
                        </div>
                      </button>
                    );
                  })}
                  <p className="flex items-center gap-1 pt-1 text-[10px] text-foreground/55">
                    <Copy className="h-2.5 w-2.5" /> Click any row to copy its URLs
                  </p>
                </div>
              )}
              {lastScan && (
                <div className="mt-5 flex items-center justify-between border-t border-foreground/8 pt-4">
                  <span className="text-[10px] uppercase tracking-wider text-foreground/55">Last Scan</span>
                  <span className="text-xs font-medium text-foreground">{timeAgo(lastScan)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Search + bulk */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/55" />
              <input
                placeholder="Search pages…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIndexedPage(1); setNotIndexedPage(1); }}
                className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.04] py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:border-emerald-500/50"
              />
            </div>
            {notIndexed.length > 0 && (
              <button onClick={bulkRequestNotIndexed} disabled={requestingUrl === "__bulk__" || !gsc} className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-2.5 text-xs font-bold text-red-500 transition-all hover:brightness-110 disabled:opacity-60">
                {requestingUrl === "__bulk__" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Index All Not-Indexed ({notIndexed.length})
              </button>
            )}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Indexed */}
            <div className="overflow-hidden rounded-2xl border border-foreground/8">
              <div className="flex items-center justify-between border-b border-foreground/8 bg-emerald-500/[0.08] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-500">Indexed Pages</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600">{indexed.length}</span>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto bg-card">
                {indexedSlice.length === 0 ? (
                  <div className="p-8 text-center text-xs text-foreground/55">No indexed pages found</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-foreground/8">
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">#</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">URL</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-foreground/55">Crawled</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-foreground/55">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indexedSlice.map((row, i) => (
                        <tr key={row.url} className="border-b border-foreground/5 transition-colors hover:bg-foreground/[0.02]">
                          <td className="px-4 py-2.5 font-mono text-xs text-foreground/55">{(indexedPage - 1) * PER_PAGE + i + 1}</td>
                          <td className="px-4 py-2.5">
                            <a href={row.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[200px] items-center gap-1 truncate text-xs font-medium text-foreground hover:underline">
                              {pathOf(row.url)} <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
                            </a>
                          </td>
                          <td className="px-4 py-2.5 text-center text-[10px] text-foreground/55">{timeAgo(row.last_crawl_time)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button onClick={() => requestIndex(row.url)} disabled={requestingUrl === row.url || !gsc} className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-[10px] font-bold text-blue-500 transition-all hover:brightness-110 disabled:opacity-50">
                              {requestingUrl === row.url ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowUpRight className="h-3 w-3" />} Reindex
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="border-t border-foreground/8 bg-card px-4 py-3">
                <Pagination page={indexedPage} totalPages={indexedTotalPages} onPage={setIndexedPage} />
              </div>
            </div>

            {/* Not Indexed */}
            <div className="overflow-hidden rounded-2xl border border-foreground/8">
              <div className="flex items-center justify-between border-b border-foreground/8 bg-red-500/[0.08] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold text-red-500">Not Indexed Pages</span>
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-bold text-red-500">{notIndexed.length}</span>
                  <button onClick={copyNotIndexedUrls} title="Copy all not-indexed URLs" className="ml-1 rounded-lg p-1.5 transition-all hover:brightness-110" style={{ background: copied ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.08)" }}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-red-500" />}
                  </button>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto bg-card">
                {notIndexedSlice.length === 0 ? (
                  <div className="p-8 text-center text-xs text-foreground/55">{checked.length === 0 ? "Run a scan to populate this list." : "All pages are indexed!"}</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-foreground/8">
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">#</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">URL</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider">
                          <button onClick={cycleSort} className={`inline-flex items-center gap-1 uppercase tracking-wider transition-all hover:brightness-125 ${notIndexedSort === "none" ? "text-foreground/55" : "text-red-500"}`} title="Sort by publish age">
                            Status {notIndexedSort === "oldest" ? <ChevronDown className="h-3 w-3" /> : notIndexedSort === "newest" ? <ChevronUp className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                          </button>
                        </th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-foreground/55">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notIndexedSlice.map((row, i) => (
                        <tr key={row.url} className="border-b border-foreground/5 transition-colors hover:bg-foreground/[0.02]">
                          <td className="px-4 py-2.5 font-mono text-xs text-foreground/55">{(notIndexedPage - 1) * PER_PAGE + i + 1}</td>
                          <td className="px-4 py-2.5">
                            <a href={row.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[200px] items-center gap-1 truncate text-xs font-medium text-foreground hover:underline">
                              {pathOf(row.url)} <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
                            </a>
                            {row.index_requested_at && (
                              <p className="mt-0.5 flex items-center gap-1 text-[9px] text-emerald-500"><Send className="h-2.5 w-2.5" /> Google {timeAgo(row.index_requested_at)}</p>
                            )}
                            {row.indexnow_requested_at && (
                              <p className="mt-0.5 flex items-center gap-1 text-[9px] text-blue-500"><Zap className="h-2.5 w-2.5" /> IndexNow {timeAgo(row.indexnow_requested_at)}</p>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="inline-block max-w-[120px] truncate rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                              {(row.coverage_state || "Unknown").slice(0, 30)}
                            </span>
                            {publishedAgo(row.published_at) && (
                              <p className="mt-1 flex items-center justify-center gap-1 text-[9px] text-foreground/55"><Clock className="h-2.5 w-2.5" /> {publishedAgo(row.published_at)}</p>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => requestIndex(row.url)} disabled={requestingUrl === row.url || !gsc} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-bold text-emerald-600 transition-all hover:brightness-110 disabled:opacity-50">
                                {requestingUrl === row.url ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Google
                              </button>
                              <button onClick={() => submitSingleIndexNow(row.url)} disabled={requestingUrl === `indexnow-${row.url}`} className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-[10px] font-bold text-blue-500 transition-all hover:brightness-110 disabled:opacity-50">
                                {requestingUrl === `indexnow-${row.url}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />} IndexNow
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="border-t border-foreground/8 bg-card px-4 py-3">
                <Pagination page={notIndexedPage} totalPages={notIndexedTotalPages} onPage={setNotIndexedPage} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
