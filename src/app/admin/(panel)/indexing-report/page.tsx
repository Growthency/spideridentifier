"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Globe,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Loader2,
  Send,
  Clock,
  FileSearch,
  Sparkles,
  Shield,
  Zap,
  Rss,
  ChevronDown,
  ChevronUp,
  Radio,
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

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
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

/* ── Donut chart ── */
function DonutChart({ indexed, total }: { indexed: number; total: number }) {
  const pct = total > 0 ? (indexed / total) * 100 : 0;
  const r = 58;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" className="stroke-foreground/5" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#f87171"
          strokeWidth="14"
          strokeDasharray={`${circ} ${circ}`}
          transform="rotate(-90 70 70)"
          strokeLinecap="round"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="14"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          transform="rotate(-90 70 70)"
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
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

const INDEXED_STATES = ["Submitted and indexed", "Indexed, not submitted in sitemap"];
const isIndexed = (r: IndexRow) => r.verdict === "PASS" || INDEXED_STATES.includes(r.coverage_state ?? "");

export default function IndexingReportAdmin() {
  const [rows, setRows] = useState<IndexRow[]>([]);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [gsc, setGsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState<"ok" | "error">("ok");

  const api = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/indexing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, json: await res.json() };
  }, []);

  const load = useCallback(async () => {
    const { ok, json } = await api({ action: "get" });
    if (ok) {
      setRows(json.rows ?? []);
      setScannedAt(json.scanned_at ?? null);
      setGsc(Boolean(json.gscConfigured));
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  async function runScan() {
    setScanning(true);
    setNotice("");
    const { ok, json } = await api({ action: "scan" });
    if (ok) {
      setRows(json.rows ?? []);
      setScannedAt(json.scanned_at ?? null);
      setNoticeKind(json.warning ? "error" : "ok");
      setNotice(json.warning || "Scan complete — every URL inspected with Search Console.");
    } else {
      setNoticeKind("error");
      setNotice(json.error || "Scan failed");
    }
    setScanning(false);
  }

  async function act(key: string, payload: Record<string, unknown>, successMsg: string) {
    setBusy(key);
    setNotice("");
    const { ok, json } = await api(payload);
    setNoticeKind(ok ? "ok" : "error");
    setNotice(ok ? successMsg : json.error || "Request failed");
    if (ok) await load();
    setBusy(null);
  }

  const checked = rows.filter((r) => r.checked_at);
  const indexed = rows.filter(isIndexed);
  const notIndexed = checked.filter((r) => !isIndexed(r));
  const indexRate = checked.length > 0 ? Math.round((indexed.length / checked.length) * 100) : 0;

  // coverage breakdown by state
  const coverage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of checked) {
      const state = r.coverage_state || "Unknown";
      counts.set(state, (counts.get(state) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [checked]);

  const filterFn = (r: IndexRow) => !query || pathOf(r.url).toLowerCase().includes(query.toLowerCase());
  const indexedFiltered = indexed.filter(filterFn);
  const notIndexedFiltered = notIndexed.filter(filterFn);
  const unscanned = rows.length - checked.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Globe className="h-5 w-5 text-[rgb(var(--gold-soft))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Indexing Report</h1>
            <p className="text-sm text-foreground/55">Monitor &amp; manage your Google search index</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-foreground/45">
            <Clock className="h-3.5 w-3.5" /> Last scan: {timeAgo(scannedAt)}
          </span>
          <button
            onClick={runScan}
            disabled={scanning || !gsc}
            title={gsc ? "Inspect every URL with Search Console" : "Connect Search Console first"}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-50"
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {scanning ? "Scanning…" : "Run Scan"}
          </button>
        </div>
      </div>

      {!gsc && (
        <div className="mb-6 rounded-xl border border-foreground/8 bg-card p-8 text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Connect Search Console</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Add <code className="text-[rgb(var(--gold-soft))]">GSC_SITE_URL</code> plus the Google service-account keys
            (guide in <code className="text-[rgb(var(--gold-soft))]">.env.example</code>) to scan your index, request
            indexing and submit sitemaps.
          </p>
        </div>
      )}

      {notice && (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 text-sm text-foreground/80 ${
            noticeKind === "error" ? "border-red-400/30 bg-red-500/8" : "border-emerald-500/25 bg-emerald-500/8"
          }`}
        >
          {notice}
        </p>
      )}

      {/* SEO Boost Tools */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-500/5">
        <button onClick={() => setToolsOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-4">
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15">
              <Sparkles className="h-4.5 w-4.5 text-violet-500" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold text-foreground">SEO Boost Tools</span>
              <span className="block text-xs text-foreground/45">IndexNow, Sitemap Submit, RSS Feed</span>
            </span>
          </span>
          {toolsOpen ? <ChevronUp className="h-4 w-4 text-foreground/40" /> : <ChevronDown className="h-4 w-4 text-foreground/40" />}
        </button>
        {toolsOpen && (
          <div className="grid gap-3 border-t border-violet-500/15 p-5 sm:grid-cols-3">
            {[
              {
                key: "tool-indexnow",
                icon: Zap,
                title: "IndexNow All Pages",
                desc: "Ping Bing, Yandex & partners instantly",
                action: () => act("tool-indexnow", { action: "indexnow", urls: rows.map((r) => r.url) }, `IndexNow ping sent for ${rows.length} URLs.`),
                disabled: false,
              },
              {
                key: "tool-sitemap",
                icon: Radio,
                title: "Submit Sitemap",
                desc: "Push sitemap.xml to Search Console",
                action: () => act("tool-sitemap", { action: "submit-sitemap" }, "Sitemap submitted to Search Console."),
                disabled: !gsc,
              },
              {
                key: "tool-feed",
                icon: Rss,
                title: "Submit RSS Feed",
                desc: "Push feed.xml as a sitemap source",
                action: () => act("tool-feed", { action: "submit-feed" }, "RSS feed submitted to Search Console."),
                disabled: !gsc,
              },
            ].map((t) => (
              <button
                key={t.key}
                onClick={t.action}
                disabled={t.disabled || busy === t.key}
                className="flex items-start gap-3 rounded-xl border border-foreground/8 bg-card p-4 text-left transition-all hover:border-violet-500/30 disabled:opacity-50"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                  {busy === t.key ? <Loader2 className="h-4 w-4 animate-spin text-violet-500" /> : <t.icon className="h-4 w-4 text-violet-500" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t.title}</span>
                  <span className="block text-xs text-foreground/45">{t.desc}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FileSearch} label="Total Pages" value={rows.length} color="#3b82f6" />
        <StatCard icon={CheckCircle2} label="Indexed" value={indexed.length} color="#10b981" />
        <StatCard icon={XCircle} label="Not Indexed" value={notIndexed.length} color="#ef4444" />
        <StatCard icon={Shield} label="Index Rate" value={`${indexRate}%`} color="#f59e0b" />
      </div>

      {/* Donut + coverage breakdown */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-foreground/8 bg-card p-6">
          <DonutChart indexed={indexed.length} total={checked.length || rows.length} />
          <div className="mt-3 flex items-center gap-5 text-xs">
            <span className="flex items-center gap-1.5 text-foreground/60">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Indexed ({indexed.length})
            </span>
            <span className="flex items-center gap-1.5 text-foreground/60">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Not Indexed ({notIndexed.length})
            </span>
          </div>
          {unscanned > 0 && (
            <p className="mt-2 text-xs text-foreground/40">{unscanned} URLs not scanned yet — hit Run Scan.</p>
          )}
        </div>

        <div className="rounded-2xl border border-foreground/8 bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Coverage Breakdown</h2>
          {coverage.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground/40">Run a scan to see Google&apos;s coverage states.</p>
          ) : (
            <div className="space-y-4">
              {coverage.map(([state, count]) => {
                const pct = Math.round((count / checked.length) * 100);
                const good = INDEXED_STATES.includes(state);
                return (
                  <div key={state}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-foreground/80">{state}</span>
                      <span className="shrink-0 font-semibold" style={{ color: good ? "#10b981" : "#f59e0b" }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-foreground/5">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: good ? "#10b981" : "#f59e0b" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-5 border-t border-foreground/8 pt-3 text-right text-[11px] uppercase tracking-wide text-foreground/35">
            Last scan&ensp;{timeAgo(scannedAt)}
          </p>
        </div>
      </div>

      {/* Search + bulk action */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
          <input
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-foreground/10 bg-card py-2.5 pl-9 pr-3 text-sm text-foreground focus:border-gold/50 focus:outline-none"
          />
        </div>
        {notIndexed.length > 0 && (
          <button
            onClick={() =>
              act("bulk", { action: "bulk-request", urls: notIndexed.map((r) => r.url) }, `Indexing requested for ${notIndexed.length} URLs.`)
            }
            disabled={busy === "bulk" || !gsc}
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/15 disabled:opacity-50"
          >
            {busy === "bulk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Index All Not-Indexed ({notIndexed.length})
          </button>
        )}
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Indexed pages */}
        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-card">
          <div className="flex items-center gap-2 border-b border-emerald-500/15 bg-emerald-500/8 px-5 py-3.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-foreground">Indexed Pages</h2>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600">{indexedFiltered.length}</span>
          </div>
          {indexedFiltered.length === 0 ? (
            <p className="p-8 text-center text-sm text-foreground/40">
              {checked.length === 0 ? "Run a scan to populate this list." : "No indexed pages match."}
            </p>
          ) : (
            <ul className="max-h-[520px] overflow-y-auto">
              {indexedFiltered.map((r) => (
                <li key={r.url} className="flex items-center gap-3 border-b border-foreground/5 px-5 py-3 last:border-0">
                  <div className="min-w-0 flex-1">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="block truncate font-mono text-xs text-foreground hover:text-emerald-500">
                      {pathOf(r.url)}
                    </a>
                    <p className="text-[11px] text-foreground/40">Crawled {timeAgo(r.last_crawl_time)}</p>
                  </div>
                  <button
                    onClick={() => act(`re-${r.url}`, { action: "request-index", url: r.url }, "Reindex requested.")}
                    disabled={busy === `re-${r.url}` || !gsc}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    {busy === `re-${r.url}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Reindex
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Not indexed pages */}
        <div className="overflow-hidden rounded-2xl border border-red-400/20 bg-card">
          <div className="flex items-center gap-2 border-b border-red-400/15 bg-red-500/8 px-5 py-3.5">
            <XCircle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-foreground">Not Indexed Pages</h2>
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-bold text-red-500">{notIndexedFiltered.length}</span>
          </div>
          {notIndexedFiltered.length === 0 ? (
            <p className="p-8 text-center text-sm text-foreground/40">
              {checked.length === 0 ? "Run a scan to populate this list." : "Everything indexed — nice!"}
            </p>
          ) : (
            <ul className="max-h-[520px] overflow-y-auto">
              {notIndexedFiltered.map((r) => {
                const pub = publishedAgo(r.published_at);
                return (
                  <li key={r.url} className="border-b border-foreground/5 px-5 py-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="block truncate font-mono text-xs text-foreground hover:text-red-400">
                          {pathOf(r.url)}
                        </a>
                        <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                          {r.coverage_state || "Unknown"}
                        </span>
                        <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-foreground/40">
                          {r.index_requested_at && (
                            <span className="flex items-center gap-1">
                              <Send className="h-2.5 w-2.5" /> Google {timeAgo(r.index_requested_at)}
                            </span>
                          )}
                          {r.indexnow_requested_at && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" /> IndexNow {timeAgo(r.indexnow_requested_at)}
                            </span>
                          )}
                          {pub && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" /> {pub}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1.5">
                        <button
                          onClick={() => act(`g-${r.url}`, { action: "request-index", url: r.url }, "Indexing requested from Google.")}
                          disabled={busy === `g-${r.url}` || !gsc}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          {busy === `g-${r.url}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          Google
                        </button>
                        <button
                          onClick={() => act(`n-${r.url}`, { action: "indexnow", urls: [r.url] }, "IndexNow ping sent.")}
                          disabled={busy === `n-${r.url}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-violet-500 hover:bg-violet-500/20 disabled:opacity-50"
                        >
                          {busy === `n-${r.url}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                          IndexNow
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
