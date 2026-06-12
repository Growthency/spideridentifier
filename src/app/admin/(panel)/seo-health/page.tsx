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
  ChevronUp,
  Clock,
} from "lucide-react";

type Severity = "critical" | "warning" | "info";
interface Issue {
  severity: Severity;
  label: string;
  detail: string;
}
interface PageResult {
  path: string;
  status: number;
  score: number;
  sizeKb: number;
  title: string;
  issues: Issue[];
  passed: string[];
}
interface GlobalCheck {
  label: string;
  pass: boolean;
  detail: string;
}
interface StoredScan {
  scanned_at: string;
  pages: PageResult[];
  globalChecks: GlobalCheck[];
}

const STORE_KEY = "seo-health-scan";

const scoreColor = (s: number) => (s >= 90 ? "#10b981" : s >= 70 ? "#f59e0b" : s >= 50 ? "#f97316" : "#ef4444");

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ScoreRing({ score, size = 160, stroke = 10 }: { score: number; size?: number; stroke?: number }) {
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

const sevMeta: Record<Severity, { color: string; icon: React.ElementType }> = {
  critical: { color: "#ef4444", icon: XCircle },
  warning: { color: "#f59e0b", icon: AlertTriangle },
  info: { color: "#3b82f6", icon: Info },
};

export default function SeoHealthAdmin() {
  const [scan, setScan] = useState<StoredScan | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "pages" | "global">("overview");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setScan(JSON.parse(raw));
    } catch {
      // corrupted cache — start fresh
    }
  }, []);

  async function runScan() {
    setScanning(true);
    setError("");
    try {
      const res = await fetch("/api/admin/seo-health", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Scan failed");
      const stored: StoredScan = json;
      setScan(stored);
      localStorage.setItem(STORE_KEY, JSON.stringify(stored));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  const stats = useMemo(() => {
    if (!scan) return null;
    const all = scan.pages.flatMap((p) => p.issues);
    const count = (s: Severity) => all.filter((i) => i.severity === s).length;
    const score = Math.round(scan.pages.reduce((s, p) => s + p.score, 0) / Math.max(1, scan.pages.length));
    return {
      score,
      critical: count("critical"),
      warning: count("warning"),
      info: count("info"),
      passedPages: scan.pages.filter((p) => p.issues.length === 0).length,
    };
  }, [scan]);

  const pagesSorted = useMemo(() => {
    if (!scan) return [];
    return scan.pages
      .filter((p) => !query || p.path.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (sortAsc ? a.score - b.score : b.score - a.score));
  }, [scan, query, sortAsc]);

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
            <p className="text-sm text-foreground/55">Full-site audit — titles, descriptions, canonicals, OG tags, H1s &amp; more</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {scan && (
            <span className="flex items-center gap-1.5 text-xs text-foreground/45">
              <Clock className="h-3.5 w-3.5" /> Last scan: {timeAgo(scan.scanned_at)}
            </span>
          )}
          <button
            onClick={runScan}
            disabled={scanning}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-50"
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {scanning ? "Scanning…" : scan ? "Re-run Scan" : "Run Scan"}
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>}

      {/* Empty state */}
      {!scan && !scanning && (
        <div className="rounded-2xl border border-foreground/8 bg-card p-16 text-center">
          <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-foreground/15" />
          <h2 className="mb-2 text-xl font-bold text-foreground">Ready to Scan</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Audits every page of the live site — every blog post, species page and static page — and grades each one.
          </p>
        </div>
      )}

      {/* Scanning state */}
      {scanning && !scan && (
        <div className="rounded-2xl border border-foreground/8 bg-card p-16 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-emerald-500" />
          <h2 className="mb-2 text-xl font-bold text-foreground">Scanning Your Site…</h2>
          <p className="text-sm text-foreground/55">Fetching and grading every page. This takes a few seconds.</p>
        </div>
      )}

      {scan && stats && (
        <>
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-foreground/10 bg-card p-1 text-sm">
            {(
              [
                ["overview", "Overview"],
                ["pages", `Pages (${scan.pages.length})`],
                ["global", "Global Checks"],
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
              <div className="mb-6 flex flex-wrap items-center gap-8 rounded-2xl border border-foreground/8 bg-card p-6">
                <ScoreRing score={stats.score} />
                <div className="min-w-[220px] flex-1">
                  <h2 className="mb-1 text-xl font-bold text-foreground">
                    {stats.score >= 90 ? "Excellent" : stats.score >= 70 ? "Good" : stats.score >= 50 ? "Needs Work" : "Critical Issues"}
                  </h2>
                  <p className="text-sm text-foreground/55">
                    {stats.passedPages} of {scan.pages.length} pages pass every check. Fix critical issues first — they
                    directly affect how Google reads the site.
                  </p>
                </div>
              </div>

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

              {/* Worst pages */}
              <h2 className="mb-3 text-base font-semibold text-foreground">Pages needing attention</h2>
              <div className="overflow-hidden rounded-2xl border border-foreground/8 bg-card">
                {pagesSorted.slice(0, 8).map((p, i) => (
                  <div key={p.path} className={`flex items-center gap-3 px-5 py-3.5 ${i < 7 ? "border-b border-foreground/5" : ""}`}>
                    <span className="rounded-lg px-2 py-1 text-xs font-bold" style={{ background: scoreColor(p.score) + "18", color: scoreColor(p.score) }}>
                      {p.score}
                    </span>
                    <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{p.path}</p>
                    <span className="shrink-0 text-xs text-foreground/45">
                      {p.issues.length} issue{p.issues.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Pages ── */}
          {tab === "pages" && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                  <input
                    placeholder="Search pages…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl border border-foreground/10 bg-card py-2.5 pl-9 pr-3 text-sm text-foreground focus:border-gold/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setSortAsc((s) => !s)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2.5 text-xs font-medium text-foreground/60 hover:bg-foreground/5"
                >
                  Score {sortAsc ? "↑ worst first" : "↓ best first"}
                </button>
              </div>

              <div className="space-y-2">
                {pagesSorted.map((p) => {
                  const open = expanded === p.path;
                  return (
                    <div key={p.path} className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
                      <button onClick={() => setExpanded(open ? null : p.path)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left">
                        <span className="rounded-lg px-2 py-1 text-xs font-bold" style={{ background: scoreColor(p.score) + "18", color: scoreColor(p.score) }}>
                          {p.score}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{p.path}</span>
                        <span className="hidden shrink-0 text-[11px] text-foreground/40 sm:block">{p.sizeKb} KB</span>
                        {(["critical", "warning", "info"] as const).map((sev) => {
                          const n = p.issues.filter((i) => i.severity === sev).length;
                          if (!n) return null;
                          return (
                            <span key={sev} className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: sevMeta[sev].color + "18", color: sevMeta[sev].color }}>
                              {n}
                            </span>
                          );
                        })}
                        {p.issues.length === 0 && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-foreground/35" /> : <ChevronDown className="h-4 w-4 shrink-0 text-foreground/35" />}
                      </button>
                      {open && (
                        <div className="grid gap-x-6 gap-y-2 border-t border-foreground/8 p-5 sm:grid-cols-2">
                          {p.issues.map((i, idx) => {
                            const Icon = sevMeta[i.severity].icon;
                            return (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: sevMeta[i.severity].color }} />
                                <span className="min-w-0">
                                  <span className="font-medium text-foreground">{i.label}</span>{" "}
                                  <span className="break-words text-foreground/45">— {i.detail}</span>
                                </span>
                              </div>
                            );
                          })}
                          {p.passed.map((label) => (
                            <div key={label} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="text-foreground/70">{label}</span>
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
              {scan.globalChecks.map((c, i) => (
                <div key={c.label} className={`flex items-center gap-3 px-5 py-4 ${i < scan.globalChecks.length - 1 ? "border-b border-foreground/5" : ""}`}>
                  {c.pass ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
                  <p className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{c.label}</p>
                  <span className="shrink-0 text-xs text-foreground/45">{c.detail}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
