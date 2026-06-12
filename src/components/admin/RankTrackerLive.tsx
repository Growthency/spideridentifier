"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  Loader2,
  RefreshCw,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
} from "lucide-react";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";

interface RankCheck {
  position: number | null;
  url: string | null;
  prev_position: number | null;
  checked_at: string;
}

interface GscStats {
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const posColor = (p: number | null | undefined) =>
  !p ? "text-foreground/40" : p <= 3 ? "text-emerald-500" : p <= 10 ? "text-amber-500" : "text-red-400";

function Delta({ check }: { check?: RankCheck }) {
  if (!check || check.position === null || check.prev_position === null) return null;
  const diff = check.prev_position - check.position; // positive = moved up
  if (diff > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500">
        <ArrowUp className="h-3 w-3" /> {diff}
      </span>
    );
  if (diff < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-400">
        <ArrowDown className="h-3 w-3" /> {Math.abs(diff)}
      </span>
    );
  return <Minus className="h-3 w-3 text-foreground/30" />;
}

/**
 * Tracked-keywords panel with live SerpApi rank checks (per-keyword and
 * check-all), deltas vs the previous check, and Search Console stats.
 */
export function RankTrackerLive({
  tracked,
  checks: initialChecks,
  gsc,
  serpConfigured,
  quota,
}: {
  tracked: string[];
  checks: Record<string, RankCheck>;
  gsc: Record<string, GscStats>;
  serpConfigured: boolean;
  quota: { searches_left: number; total: number } | null;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [checks, setChecks] = useState(initialChecks);
  const [checking, setChecking] = useState<string | null>(null);
  const [left, setLeft] = useState(quota?.searches_left ?? 0);
  const [error, setError] = useState("");
  const { call, saving } = useSiteAdmin();

  async function saveTracked(next: string[]) {
    const ok = await call({ action: "set_content", key: "tracked_keywords", value: next });
    if (ok) router.refresh();
  }

  async function runCheck(payload: Record<string, unknown>, busyKey: string) {
    setChecking(busyKey);
    setError("");
    try {
      const res = await fetch("/api/admin/rank-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Check failed");
      setChecks((c) => ({ ...c, ...json.results }));
      if (json.quota) setLeft(json.quota.searches_left);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check failed");
    } finally {
      setChecking(null);
    }
  }

  const add = () => {
    if (!keyword.trim()) return;
    saveTracked([...new Set([...tracked, keyword.trim().toLowerCase()])]);
    setKeyword("");
  };

  return (
    <div className="mb-8">
      {/* Add + check-all row */}
      <div className="mb-4 rounded-xl border border-foreground/8 bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            placeholder="Track a keyword (e.g. spider identifier)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="min-w-[220px] flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground focus:border-gold/50 focus:outline-none"
          />
          <button
            onClick={add}
            disabled={saving || !keyword.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Track
          </button>
          {tracked.length > 0 && (
            <button
              onClick={() => runCheck({ action: "check-all", keywords: tracked }, "__all__")}
              disabled={!serpConfigured || checking !== null}
              title={serpConfigured ? "Live-check every tracked keyword on Google" : "Add SERPAPI_KEY first"}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-500 hover:bg-violet-500/15 disabled:opacity-50"
            >
              {checking === "__all__" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Check All Live
            </button>
          )}
          <span
            className={`ml-auto rounded-full px-3 py-1.5 text-xs font-semibold ${
              serpConfigured ? "bg-emerald-500/10 text-emerald-600" : "bg-foreground/8 text-foreground/45"
            }`}
            title="SerpApi searches remaining this cycle"
          >
            {serpConfigured ? `SerpApi: ${left} left` : "SerpApi: add SERPAPI_KEY"}
          </span>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {/* Tracked table */}
      {tracked.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.02] text-left text-xs uppercase tracking-wide text-foreground/45">
              <tr>
                <th className="p-4 font-medium">Tracked keyword</th>
                <th className="p-4 text-center font-medium">Live Rank</th>
                <th className="hidden p-4 text-center font-medium sm:table-cell">GSC Position</th>
                <th className="hidden p-4 text-right font-medium md:table-cell">Clicks</th>
                <th className="hidden p-4 text-right font-medium md:table-cell">Impressions</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tracked.map((kw) => {
                const check = checks[kw];
                const g = gsc[kw];
                return (
                  <tr key={kw} className="border-t border-foreground/8">
                    <td className="p-4">
                      <p className="font-medium text-foreground">{kw}</p>
                      {check && (
                        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-foreground/40">
                          checked {timeAgo(check.checked_at)}
                          {check.url && (
                            <a href={check.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 hover:text-emerald-500">
                              <ExternalLink className="h-2.5 w-2.5" /> ranking page
                            </a>
                          )}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-lg font-bold ${posColor(check?.position)}`}>
                        {check ? (check.position ? `#${check.position}` : "100+") : "—"}
                      </span>{" "}
                      <Delta check={check} />
                    </td>
                    <td className={`hidden p-4 text-center font-semibold sm:table-cell ${posColor(g?.position)}`}>
                      {g?.position ? g.position.toFixed(1) : "—"}
                    </td>
                    <td className="hidden p-4 text-right text-foreground/70 md:table-cell">{g?.clicks ?? 0}</td>
                    <td className="hidden p-4 text-right text-foreground/70 md:table-cell">{g?.impressions ?? 0}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => runCheck({ action: "check", keyword: kw }, kw)}
                          disabled={!serpConfigured || checking !== null}
                          title={serpConfigured ? "Check live Google rank (1 SerpApi search)" : "Add SERPAPI_KEY first"}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-violet-500 hover:bg-violet-500/20 disabled:opacity-50"
                        >
                          {checking === kw ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                          Check
                        </button>
                        <button
                          onClick={() => saveTracked(tracked.filter((t) => t !== kw))}
                          title="Stop tracking"
                          className="rounded-lg p-1.5 hover:opacity-70"
                          style={{ background: "#ef444418", color: "#ef4444" }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
