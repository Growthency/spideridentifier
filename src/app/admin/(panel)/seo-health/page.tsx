"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  Play,
  Zap,
  FileText,
  Share2,
  Twitter,
  Type,
  Image as ImageIcon,
  Code2,
  Settings2,
  Gauge,
  Link2,
} from "lucide-react";

type Severity = "critical" | "warning" | "info";
type Category = "meta" | "og" | "twitter" | "headings" | "images" | "schema" | "technical" | "performance" | "links";

interface Issue {
  severity: Severity;
  category: Category;
  label: string;
  hint: string;
}
interface Passed {
  category: Category;
  label: string;
}
interface PageResult {
  path: string;
  status: number;
  score: number;
  sizeKb: number;
  title: string;
  issues: Issue[];
  passed: Passed[];
}
interface GlobalCheck {
  label: string;
  pass: boolean;
  detail: string;
}
interface Store {
  scanned_at: string;
  pages: PageResult[];
  serverGlobal: GlobalCheck[];
  allPaths: string[];
}

const STORE_KEY = "seo-health-v2";
const BATCH = 25;

const CATEGORIES: { key: Category; label: string; icon: React.ElementType }[] = [
  { key: "meta", label: "Meta Tags", icon: FileText },
  { key: "og", label: "Open Graph", icon: Share2 },
  { key: "twitter", label: "Twitter Cards", icon: Twitter },
  { key: "headings", label: "Headings", icon: Type },
  { key: "images", label: "Images", icon: ImageIcon },
  { key: "schema", label: "Structured Data", icon: Code2 },
  { key: "technical", label: "Technical", icon: Settings2 },
  { key: "performance", label: "Performance", icon: Gauge },
  { key: "links", label: "Internal Links", icon: Link2 },
];

const scoreColor = (s: number) => (s >= 90 ? "#10b981" : s >= 70 ? "#f59e0b" : s >= 50 ? "#f97316" : "#ef4444");

const sevMeta: Record<Severity, { color: string; icon: React.ElementType }> = {
  critical: { color: "#ef4444", icon: XCircle },
  warning: { color: "#f59e0b", icon: AlertTriangle },
  info: { color: "#3b82f6", icon: Info },
};

function ScoreRing({ score }: { score: number }) {
  const size = 150;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-foreground/8" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs font-medium text-foreground/45">/ 100</span>
      </div>
    </div>
  );
}

type SortField = "score" | "size" | "critical" | "warn" | "info" | "path";

export default function SeoHealthAdmin() {
  const [store, setStore] = useState<Store | null>(null);
  const [allPaths, setAllPaths] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "pages" | "global">("overview");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortAsc, setSortAsc] = useState(true);

  // load persisted scan + the canonical path list
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Store;
        setStore(s);
        setAllPaths(s.allPaths ?? []);
      }
    } catch {
      // corrupted cache — start fresh
    }
    fetch("/api/admin/seo-health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "paths" }),
    })
      .then((r) => r.json())
      .then((j) => j.paths && setAllPaths(j.paths))
      .catch(() => {});
  }, []);

  const persist = (s: Store) => {
    setStore(s);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch {
      // storage full — keep in-memory only
    }
  };

  const scannedPaths = useMemo(() => new Set((store?.pages ?? []).map((p) => p.path)), [store]);
  const remaining = allPaths.filter((p) => !scannedPaths.has(p));

  async function scanBatch(paths: string[], base?: Store): Promise<Store | null> {
    const res = await fetch("/api/admin/seo-health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "audit", paths }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Scan failed");
    const prev = base ?? store ?? { scanned_at: "", pages: [], serverGlobal: [], allPaths };
    const merged: Store = {
      scanned_at: new Date().toISOString(),
      allPaths,
      serverGlobal: prev.serverGlobal,
      pages: [...prev.pages.filter((p) => !paths.includes(p.path)), ...json.pages],
    };
    persist(merged);
    return merged;
  }

  async function ensureGlobal(s: Store) {
    if (s.serverGlobal.length) return;
    try {
      const res = await fetch("/api/admin/seo-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "global" }),
      });
      const json = await res.json();
      if (res.ok) persist({ ...s, serverGlobal: json.checks ?? [] });
    } catch {
      // non-fatal
    }
  }

  async function scanNext() {
    if (!remaining.length) return;
    setScanning(true);
    setError("");
    try {
      const s = await scanBatch(remaining.slice(0, BATCH));
      if (s) await ensureGlobal(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  async function scanAll(fresh = false) {
    setScanning(true);
    setError("");
    try {
      let current: Store = fresh
        ? { scanned_at: "", pages: [], serverGlobal: [], allPaths }
        : store ?? { scanned_at: "", pages: [], serverGlobal: [], allPaths };
      if (fresh) persist(current);
      const todo = allPaths.filter((p) => !current.pages.some((x) => x.path === p));
      for (let i = 0; i < todo.length; i += BATCH) {
        const next = await scanBatch(todo.slice(i, i + BATCH), current);
        if (next) current = next;
      }
      await ensureGlobal(current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  /* ── derived stats ── */
  const pages = store?.pages ?? [];
  const stats = useMemo(() => {
    const all = pages.flatMap((p) => p.issues);
    const count = (s: Severity) => all.filter((i) => i.severity === s).length;
    const score = pages.length ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length) : 0;
    return {
      score,
      issues: all.length,
      critical: count("critical"),
      warning: count("warning"),
      info: count("info"),
      passedPages: pages.filter((p) => p.issues.length === 0).length,
    };
  }, [pages]);

  const categories = useMemo(
    () =>
      CATEGORIES.map((c) => {
        const pass = pages.reduce((s, p) => s + p.passed.filter((x) => x.category === c.key).length, 0);
        const fail = pages.reduce((s, p) => s + p.issues.filter((x) => x.category === c.key).length, 0);
        const total = pass + fail;
        return { ...c, pass, total, pct: total ? Math.round((pass / total) * 100) : 100 };
      }),
    [pages]
  );

  const topIssues = useMemo(() => {
    const map = new Map<string, { label: string; severity: Severity; hint: string; pages: number }>();
    for (const p of pages) {
      const seen = new Set<string>();
      for (const i of p.issues) {
        const key = i.label.replace(/\d+/g, "N"); // group "65 chars" with "77 chars"
        if (seen.has(key)) continue;
        seen.add(key);
        const cur = map.get(key);
        if (cur) cur.pages += 1;
        else map.set(key, { label: i.label, severity: i.severity, hint: i.hint, pages: 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.pages - a.pages).slice(0, 10);
  }, [pages]);

  const derivedGlobal = useMemo((): GlobalCheck[] => {
    if (!pages.length) return [];
    const titles = pages.map((p) => p.title);
    const dupTitles = titles.length - new Set(titles).size;
    const descMissing = pages.filter((p) => p.issues.some((i) => i.label === "Missing meta description")).length;
    const insecure = pages.filter((p) => p.issues.some((i) => i.label.includes("insecure http://"))).length;
    const non200 = pages.filter((p) => p.status !== 200).length;
    const canonicalIssues = pages.filter((p) => p.issues.some((i) => i.label.includes("canonical"))).length;
    return [
      { label: "Unique Titles", pass: dupTitles === 0, detail: dupTitles === 0 ? "All page titles are unique" : `${dupTitles} duplicate titles` },
      { label: "Unique Descriptions", pass: descMissing === 0, detail: descMissing === 0 ? "Meta descriptions present on all pages" : `${descMissing} pages missing descriptions` },
      { label: "Https Enforced", pass: insecure === 0, detail: insecure === 0 ? "All pages use HTTPS" : `${insecure} pages reference http://` },
      { label: "No 404 Pages", pass: non200 === 0, detail: non200 === 0 ? "No broken pages found in sitemap" : `${non200} pages not returning 200` },
      { label: "Consistent Canonicals", pass: canonicalIssues === 0, detail: canonicalIssues === 0 ? "All pages have proper canonical URLs" : `${canonicalIssues} canonical issues` },
      { label: "Sitemap Coverage", pass: non200 === 0, detail: `${pages.length - non200}/${pages.length} sitemap URLs are accessible` },
    ];
  }, [pages]);

  const globalAll = [...(store?.serverGlobal ?? []), ...derivedGlobal];

  const pagesSorted = useMemo(() => {
    const sev = (p: PageResult, s: Severity) => p.issues.filter((i) => i.severity === s).length;
    const val = (p: PageResult): number | string =>
      sortField === "score"
        ? p.score
        : sortField === "size"
          ? p.sizeKb
          : sortField === "critical"
            ? sev(p, "critical")
            : sortField === "warn"
              ? sev(p, "warning")
              : sortField === "info"
                ? sev(p, "info")
                : p.path;
    return pages
      .filter((p) => !query || p.path.toLowerCase().includes(query.toLowerCase()) || p.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const av = val(a);
        const bv = val(b);
        const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sortAsc ? cmp : -cmp;
      });
  }, [pages, query, sortField, sortAsc]);

  function exportCsv() {
    const rows = [
      ["path", "title", "score", "size_kb", "status", "critical", "warnings", "info", "issues"],
      ...pages.map((p) => [
        p.path,
        `"${p.title.replace(/"/g, '""')}"`,
        p.score,
        p.sizeKb,
        p.status,
        p.issues.filter((i) => i.severity === "critical").length,
        p.issues.filter((i) => i.severity === "warning").length,
        p.issues.filter((i) => i.severity === "info").length,
        `"${p.issues.map((i) => i.label).join("; ").replace(/"/g, '""')}"`,
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seo-health-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const sortHeader = (field: SortField, label: string, alignRight = true) => (
    <button
      onClick={() => {
        if (sortField === field) setSortAsc((s) => !s);
        else {
          setSortField(field);
          setSortAsc(field === "score" || field === "path");
        }
      }}
      className={`flex w-full items-center gap-1 text-xs font-medium uppercase tracking-wide ${alignRight ? "justify-end" : ""} ${
        sortField === field ? "text-foreground" : "text-foreground/45"
      }`}
    >
      {label}
      <ChevronDown className={`h-3 w-3 transition-transform ${sortField === field && !sortAsc ? "rotate-180" : ""}`} />
    </button>
  );

  const scannedCount = pages.length;
  const total = allPaths.length || scannedCount;
  const progress = total ? Math.round((scannedCount / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <ShieldCheck className="h-5 w-5 text-[rgb(var(--gold-soft))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">SEO Health</h1>
            <p className="text-sm text-foreground/55">Comprehensive technical SEO audit for all your pages</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {scannedCount > 0 && (
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-foreground/10 bg-card px-4 py-2.5 text-sm font-medium text-foreground/70 hover:bg-foreground/5"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
          <button
            onClick={() => scanAll(true)}
            disabled={scanning || !allPaths.length}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-50"
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {scanning ? "Scanning…" : "Re-scan"}
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>}

      {/* Progress bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-foreground/8 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">
          {scannedCount} / {total} pages scanned
        </p>
        {remaining.length > 0 && (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600">{remaining.length} remaining</span>
        )}
        <div className="h-2 min-w-[120px] flex-1 rounded-full bg-foreground/8">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {remaining.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={scanNext}
              disabled={scanning}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" /> Scan Next {Math.min(BATCH, remaining.length)}
            </button>
            <button
              onClick={() => scanAll(false)}
              disabled={scanning}
              className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs font-semibold text-foreground/70 hover:bg-foreground/5 disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5" /> Scan All ({remaining.length})
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {scannedCount === 0 && !scanning && (
        <div className="rounded-2xl border border-foreground/8 bg-card p-16 text-center">
          <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-foreground/15" />
          <h2 className="mb-2 text-xl font-bold text-foreground">Ready to Scan</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Audits every page of the live site — 33 checks per page across meta tags, Open Graph, Twitter cards,
            headings, images, structured data and more.
          </p>
        </div>
      )}
      {scannedCount === 0 && scanning && (
        <div className="rounded-2xl border border-foreground/8 bg-card p-16 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-emerald-500" />
          <h2 className="mb-2 text-xl font-bold text-foreground">Scanning Your Site…</h2>
          <p className="text-sm text-foreground/55">Fetching and grading pages in batches of {BATCH}.</p>
        </div>
      )}

      {scannedCount > 0 && (
        <>
          {/* Score panel */}
          <div className="mb-6 flex flex-wrap items-center gap-8 rounded-2xl border border-foreground/8 bg-card p-6">
            <ScoreRing score={stats.score} />
            <div className="min-w-[240px] flex-1">
              <h2 className="mb-1 text-xl font-bold text-foreground">
                {stats.score >= 90 ? "Excellent" : stats.score >= 70 ? "Good" : stats.score >= 50 ? "Needs Work" : "Critical Issues"}
              </h2>
              <p className="text-sm text-foreground/55">
                {scannedCount} pages scanned · {stats.issues} issues found
                {remaining.length > 0 && <span className="text-amber-600"> ({remaining.length} pages remaining)</span>}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-red-500/12 px-2.5 py-1 text-xs font-bold text-red-500">{stats.critical} Critical</span>
                <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-bold text-amber-600">{stats.warning} Warnings</span>
                <span className="rounded-full bg-sky-500/12 px-2.5 py-1 text-xs font-bold text-sky-500">{stats.info} Info</span>
                <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-bold text-emerald-600">{stats.passedPages} Passed</span>
              </div>
              {store?.scanned_at && (
                <p className="mt-2 text-xs text-foreground/40">Last scanned: {new Date(store.scanned_at).toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(
              [
                ["Critical", stats.critical, "#ef4444", XCircle],
                ["Warnings", stats.warning, "#f59e0b", AlertTriangle],
                ["Info", stats.info, "#3b82f6", Info],
                ["Pages Passed", stats.passedPages, "#10b981", CheckCircle2],
              ] as const
            ).map(([label, count, color, Icon]) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-foreground/8 bg-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color + "14" }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </span>
                <div>
                  <p className="text-2xl font-bold" style={{ color }}>
                    {count}
                  </p>
                  <p className="text-xs text-foreground/45">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl border border-foreground/10 bg-card p-1 text-sm">
            {(
              [
                ["overview", "Overview"],
                ["pages", `Pages (${scannedCount})`],
                ["global", `Global Checks (${globalAll.length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  tab === key ? "bg-emerald-500/15 text-emerald-500" : "text-foreground/55 hover:bg-foreground/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {tab === "overview" && (
            <>
              <h2 className="mb-3 text-base font-semibold text-foreground">Category Breakdown</h2>
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((c) => (
                  <div key={c.key} className="rounded-2xl border border-foreground/8 bg-card p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <c.icon className="h-4 w-4 text-[rgb(var(--gold-soft))]" />
                      <p className="text-sm font-semibold text-foreground">{c.label}</p>
                      <span className="ml-auto text-xs font-bold" style={{ color: scoreColor(c.pct) }}>
                        {c.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-foreground/8">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.pct}%`, background: scoreColor(c.pct) }} />
                    </div>
                    <p className="mt-2 text-xs text-foreground/45">
                      {c.pass}/{c.total} checks passed
                    </p>
                  </div>
                ))}
              </div>

              <h2 className="mb-3 text-base font-semibold text-foreground">Top Issues</h2>
              <div className="overflow-hidden rounded-2xl border border-foreground/8 bg-card">
                {topIssues.length === 0 ? (
                  <p className="p-10 text-center text-sm text-foreground/45">No issues — perfect score! 🎉</p>
                ) : (
                  topIssues.map((i, idx) => {
                    const Icon = sevMeta[i.severity].icon;
                    return (
                      <div key={idx} className={`flex items-center gap-3 px-5 py-4 ${idx < topIssues.length - 1 ? "border-b border-foreground/5" : ""}`}>
                        <Icon className="h-4 w-4 shrink-0" style={{ color: sevMeta[i.severity].color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {i.label}{" "}
                            <span
                              className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold lowercase"
                              style={{ background: sevMeta[i.severity].color + "18", color: sevMeta[i.severity].color }}
                            >
                              {i.severity}
                            </span>
                          </p>
                          <p className="text-xs text-foreground/50">{i.hint}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-bold text-foreground">{i.pages}</p>
                          <p className="text-[10px] text-foreground/40">pages</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ── Pages ── */}
          {tab === "pages" && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                <input
                  placeholder="Search pages…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-foreground/10 bg-card py-2.5 pl-9 pr-3 text-sm text-foreground focus:border-gold/50 focus:outline-none"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-foreground/8 bg-card">
                {/* header */}
                <div className="grid grid-cols-[1fr_64px_70px_72px_64px_56px_56px] items-center gap-2 border-b border-foreground/8 bg-foreground/[0.02] px-4 py-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-foreground/45">Page</span>
                  {sortHeader("score", "Score")}
                  {sortHeader("size", "Size")}
                  {sortHeader("critical", "Critical")}
                  {sortHeader("warn", "Warn")}
                  {sortHeader("info", "Info")}
                  <span className="text-right text-xs font-medium uppercase tracking-wide text-foreground/45">Status</span>
                </div>
                {pagesSorted.map((p) => {
                  const open = expanded === p.path;
                  const crit = p.issues.filter((i) => i.severity === "critical").length;
                  const warn = p.issues.filter((i) => i.severity === "warning").length;
                  const info = p.issues.filter((i) => i.severity === "info").length;
                  return (
                    <div key={p.path} className="border-b border-foreground/5 last:border-0">
                      <button
                        onClick={() => setExpanded(open ? null : p.path)}
                        className="grid w-full grid-cols-[1fr_64px_70px_72px_64px_56px_56px] items-center gap-2 px-4 py-3 text-left hover:bg-foreground/[0.02]"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          {open ? (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground/35" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground/35" />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-mono text-xs font-semibold text-foreground">{p.path}</span>
                            <span className="block truncate text-[11px] text-foreground/40">{p.title}</span>
                          </span>
                        </span>
                        <span
                          className="justify-self-end rounded-md px-2 py-1 text-xs font-bold"
                          style={{ background: scoreColor(p.score) + "18", color: scoreColor(p.score) }}
                        >
                          {p.score}
                        </span>
                        <span className="justify-self-end text-xs text-foreground/55">{p.sizeKb}KB</span>
                        <span className={`justify-self-end text-sm font-bold ${crit ? "text-red-500" : "text-foreground/25"}`}>{crit}</span>
                        <span className={`justify-self-end text-sm font-bold ${warn ? "text-amber-500" : "text-foreground/25"}`}>{warn}</span>
                        <span className={`justify-self-end text-sm font-bold ${info ? "text-sky-500" : "text-foreground/25"}`}>{info}</span>
                        <span className="justify-self-end">
                          {crit === 0 && p.status === 200 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      </button>
                      {open && (
                        <div className="grid gap-x-6 gap-y-2 border-t border-foreground/5 bg-foreground/[0.015] p-5 sm:grid-cols-2">
                          {p.issues.map((i, idx) => {
                            const Icon = sevMeta[i.severity].icon;
                            return (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: sevMeta[i.severity].color }} />
                                <span className="min-w-0">
                                  <span className="font-medium text-foreground">{i.label}</span>{" "}
                                  <span className="break-words text-foreground/45">— {i.hint}</span>
                                </span>
                              </div>
                            );
                          })}
                          {p.passed.map((c, idx) => (
                            <div key={`p-${idx}`} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="text-foreground/70">{c.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Global checks ── */}
          {tab === "global" && (
            <div className="overflow-hidden rounded-2xl border border-foreground/8 bg-card">
              {globalAll.map((c, i) => (
                <div key={c.label} className={`flex items-center gap-3 px-5 py-4 ${i < globalAll.length - 1 ? "border-b border-foreground/5" : ""}`}>
                  {c.pass ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {c.label}{" "}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.pass ? "bg-emerald-500/12 text-emerald-600" : "bg-red-500/12 text-red-500"
                        }`}
                      >
                        {c.pass ? "Passed" : "Failed"}
                      </span>
                    </p>
                    <p className="text-xs text-foreground/50">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
