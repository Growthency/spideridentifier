"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Play,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Trophy,
  AlertCircle,
  Clock,
  BarChart3,
  X,
  Zap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Keyword {
  id: number;
  keyword: string;
  position: number | null;
  prev_position: number | null;
  change: number | null;
  rank_url: string | null;
  volume: number | null;
  checked_at: string | null;
  created_at: string;
}

interface Quota {
  used: number;
  limit: number;
  remaining: number;
  resetAt?: string;
  keyCount?: number;
}

function fmtVol(v: number | null) {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(v);
}
function formatResetDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}
function timeAgo(d: string | null) {
  if (!d) return "Never";
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function pathOf(url: string) {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}

/* ── Donut: SerpApi searches remaining ── */
function QuotaDonut({ used, limit }: { used: number; limit: number }) {
  const remaining = Math.max(0, limit - used);
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct < 50 ? "#10b981" : pct < 80 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgb(var(--foreground) / 0.08)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{remaining}</span>
        <span className="text-[10px] uppercase tracking-wider text-foreground/50">remaining</span>
      </div>
    </div>
  );
}

/* ── Colored position badge ── */
function PositionBadge({ position }: { position: number | null }) {
  if (position === null) {
    return (
      <div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "rgba(100,116,139,0.15)" }}>
        <span className="text-xs font-bold text-foreground/45">N/A</span>
      </div>
    );
  }
  let bg: string, color: string, glow: string;
  if (position <= 3) { bg = "linear-gradient(135deg,#fbbf24,#f59e0b)"; color = "#000"; glow = "0 0 20px rgba(251,191,36,0.4)"; }
  else if (position <= 10) { bg = "linear-gradient(135deg,#34d399,#10b981)"; color = "#000"; glow = "0 0 20px rgba(16,185,129,0.3)"; }
  else if (position <= 30) { bg = "linear-gradient(135deg,#60a5fa,#3b82f6)"; color = "#fff"; glow = "0 0 15px rgba(59,130,246,0.3)"; }
  else if (position <= 50) { bg = "linear-gradient(135deg,#fb923c,#f97316)"; color = "#fff"; glow = "0 0 15px rgba(249,115,22,0.3)"; }
  else { bg = "linear-gradient(135deg,#f87171,#ef4444)"; color = "#fff"; glow = "0 0 15px rgba(239,68,68,0.3)"; }
  return (
    <div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: bg, boxShadow: glow }}>
      <span className="text-lg font-black" style={{ color }}>#{position}</span>
    </div>
  );
}

/* ── Change arrow ── */
function ChangeIndicator({ change }: { change: number | null }) {
  if (change === null) return <span className="text-xs text-foreground/40">—</span>;
  if (change > 0)
    return (
      <div className="flex items-center gap-1 text-emerald-500">
        <TrendingUp className="h-3.5 w-3.5" /> <span className="text-xs font-bold">+{change}</span>
      </div>
    );
  if (change < 0)
    return (
      <div className="flex items-center gap-1 text-red-400">
        <TrendingDown className="h-3.5 w-3.5" /> <span className="text-xs font-bold">{change}</span>
      </div>
    );
  return (
    <div className="flex items-center gap-1 text-foreground/50">
      <Minus className="h-3.5 w-3.5" /> <span className="text-xs">0</span>
    </div>
  );
}

const GRID = "40px 1fr 80px 100px 80px 1fr 80px 44px 40px";

function StatCard({ label, icon: Icon, iconClass, value, sub }: { label: string; icon: React.ElementType; iconClass: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-2xl border border-foreground/8 bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-foreground/55">{label}</span>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-foreground/55">{sub}</p>
    </div>
  );
}

export function RankTrackerLive() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [quota, setQuota] = useState<Quota>({ used: 0, limit: 250, remaining: 250 });
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkingSingle, setCheckingSingle] = useState<number | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState("");
  const [editingVol, setEditingVol] = useState<number | null>(null);
  const [volInput, setVolInput] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "position" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/rank-tracker");
      const data = await res.json();
      setKeywords(data.keywords || []);
      if (data.quota) setQuota(data.quota);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSort = (col: "volume" | "position") => {
    if (sortBy === col) {
      if (sortDir === "desc") setSortDir("asc");
      else { setSortBy(null); setSortDir("desc"); }
    } else { setSortBy(col); setSortDir("desc"); }
  };

  const sorted = useMemo(() => {
    if (!sortBy) return keywords;
    return [...keywords].sort((a, b) => {
      const av = sortBy === "volume" ? a.volume ?? 0 : a.position ?? 999;
      const bv = sortBy === "volume" ? b.volume ?? 0 : b.position ?? 999;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [keywords, sortBy, sortDir]);

  async function handleAdd() {
    if (!newKeyword.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/rank-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", keyword: newKeyword.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewKeyword("");
      setShowInput(false);
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    }
    setAdding(false);
  }

  async function handleDelete(id: number) {
    try {
      await fetch("/api/admin/rank-tracker", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setKeywords((p) => p.filter((k) => k.id !== id));
    } catch {
      /* ignore */
    }
  }

  async function handleRunCheck() {
    if (!keywords.length) return;
    setChecking(true);
    setCheckProgress(0);
    setError("");
    const iv = setInterval(() => setCheckProgress((p) => (p < 90 ? p + (90 - p) * 0.05 : p)), 200);
    try {
      const res = await fetch("/api/admin/rank-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCheckProgress(100);
      setTimeout(() => { fetchData(); setChecking(false); setCheckProgress(0); }, 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check failed");
      setChecking(false);
      setCheckProgress(0);
    }
    clearInterval(iv);
  }

  async function handleRunSingle(id: number) {
    setCheckingSingle(id);
    setError("");
    try {
      const res = await fetch("/api/admin/rank-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_single", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.result) setKeywords((p) => p.map((k) => (k.id === id ? { ...k, ...data.result } : k)));
      const q = await (await fetch("/api/admin/rank-tracker")).json();
      if (q.quota) setQuota(q.quota);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check failed");
    }
    setCheckingSingle(null);
  }

  async function handleVolSave(id: number) {
    const vol = volInput.trim() ? parseInt(volInput.replace(/[^0-9]/g, ""), 10) || null : null;
    try {
      await fetch("/api/admin/rank-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_volume", id, volume: vol }),
      });
      setKeywords((p) => p.map((k) => (k.id === id ? { ...k, volume: vol } : k)));
    } catch {
      /* ignore */
    }
    setEditingVol(null);
    setVolInput("");
  }

  const ranked = keywords.filter((k) => k.position !== null);
  const top10 = keywords.filter((k) => k.position !== null && k.position <= 10).length;
  const avgPos = ranked.length ? Math.round((ranked.reduce((a, k) => a + (k.position || 0), 0) / ranked.length) * 10) / 10 : 0;

  const card = "rounded-2xl border border-foreground/8 bg-card";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rank Tracker</h1>
          <p className="mt-0.5 text-sm text-foreground/55">Track your Google rankings for target keywords (US)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={`${card} col-span-2 row-span-2 flex flex-col items-center justify-center p-6 lg:col-span-1`}>
          <QuotaDonut used={quota.used} limit={quota.limit} />
          <p className="mt-3 text-xs font-medium text-foreground/55">
            {quota.used} / {quota.limit} searches used
          </p>
          <p className="mt-1 text-[10px] text-foreground/40">This month</p>
          {quota.resetAt && (
            <div className="mt-3 flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-1">
              <Clock className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-500">
                Refills {formatResetDate(quota.resetAt)}<span className="opacity-70"> · in {daysUntil(quota.resetAt)}d</span>
              </span>
            </div>
          )}
          {typeof quota.keyCount === "number" && (
            <div
              className="mt-2 rounded-full px-2.5 py-1"
              style={{
                background: quota.keyCount >= 2 ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.12)",
                border: `1px solid ${quota.keyCount >= 2 ? "rgba(16,185,129,0.22)" : "rgba(245,158,11,0.35)"}`,
              }}
            >
              <span className="text-[10px] font-semibold" style={{ color: quota.keyCount >= 2 ? "#10b981" : "#f59e0b" }}>
                {quota.keyCount} key{quota.keyCount === 1 ? "" : "s"} loaded
              </span>
            </div>
          )}
        </div>

        <StatCard label="Keywords" icon={Target} iconClass="text-violet-400" value={keywords.length} sub="tracked" />
        <StatCard label="Top 10" icon={Trophy} iconClass="text-amber-400" value={top10} sub="keywords" />
        <StatCard label="Avg Position" icon={TrendingUp} iconClass="text-emerald-500" value={avgPos > 0 ? `#${avgPos}` : "—"} sub="across all" />
        <div className={`${card} p-5`}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground/55">Ranking</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {ranked.length}<span className="text-lg text-foreground/50">/{keywords.length}</span>
          </p>
          <p className="mt-1 text-xs text-foreground/55">found in top 100</p>
        </div>
        <div className={`${card} p-5`}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground/55">Last Check</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-foreground">{keywords[0]?.checked_at ? timeAgo(keywords[0].checked_at) : "Never"}</p>
          <p className="mt-1 text-xs text-foreground/55">
            {keywords.length > 0 ? `uses ${keywords.length} search${keywords.length === 1 ? "" : "es"}` : "add keywords first"}
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" /> Add Keyword
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. spider identifier"
                autoFocus
                className="w-64 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={handleAdd}
                disabled={adding || !newKeyword.trim()}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </button>
              <button onClick={() => { setShowInput(false); setNewKeyword(""); setError(""); }} className="rounded-xl p-2.5 text-foreground/55">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleRunCheck}
          disabled={checking || keywords.length === 0}
          className="relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          style={{
            background: checking ? "linear-gradient(135deg,#0ea5e9,#06b6d4)" : "linear-gradient(135deg,#10b981,#059669)",
            boxShadow: checking ? "0 4px 20px rgba(14,165,233,0.4)" : "0 4px 20px rgba(16,185,129,0.4)",
          }}
        >
          {checking && <div className="absolute inset-y-0 left-0 bg-white/15 transition-all duration-300" style={{ width: `${checkProgress}%` }} />}
          <span className="relative z-10 flex items-center gap-2">
            {checking ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Checking {keywords.length} keywords...</>
            ) : (
              <><Play className="h-4 w-4" fill="currentColor" /> Run Check</>
            )}
          </span>
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Table */}
      {keywords.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <Search className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">No keywords yet</h3>
          <p className="text-sm text-foreground/55">Add your target keywords to start tracking their Google rankings.</p>
          <button onClick={() => setShowInput(true)} className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
            <Plus className="mr-2 inline h-4 w-4" /> Add Your First Keyword
          </button>
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <div className="min-w-[760px]">
            <div className="grid gap-4 border-b border-foreground/8 bg-foreground/[0.02] px-6 py-3 text-xs font-medium uppercase tracking-wider text-foreground/55" style={{ gridTemplateColumns: GRID }}>
              <div>#</div>
              <div>Keyword</div>
              <button onClick={() => toggleSort("volume")} className="flex items-center justify-center gap-1 hover:opacity-70" title="Sort by volume">
                Volume {sortBy === "volume" ? (sortDir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
              </button>
              <button onClick={() => toggleSort("position")} className="flex items-center justify-center gap-1 hover:opacity-70" title="Sort by position">
                <span className="text-base leading-none">🇺🇸</span> Position {sortBy === "position" ? (sortDir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
              </button>
              <div className="text-center">Change</div>
              <div>Ranking URL</div>
              <div className="text-center">Checked</div>
              <div></div>
              <div></div>
            </div>

            {sorted.map((kw, idx) => (
              <div
                key={kw.id}
                className="group grid items-center gap-4 px-6 py-4 transition-colors hover:bg-foreground/[0.02]"
                style={{ gridTemplateColumns: GRID, borderBottom: idx < sorted.length - 1 ? "1px solid rgb(var(--foreground) / 0.08)" : "none" }}
              >
                <span className="font-mono text-sm text-foreground/40">{idx + 1}</span>
                <p className="truncate text-sm font-semibold text-foreground">{kw.keyword}</p>
                <div className="flex justify-center">
                  {editingVol === kw.id ? (
                    <input
                      value={volInput}
                      onChange={(e) => setVolInput(e.target.value)}
                      onBlur={() => handleVolSave(kw.id)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleVolSave(kw.id); if (e.key === "Escape") { setEditingVol(null); setVolInput(""); } }}
                      autoFocus
                      placeholder="0"
                      className="w-16 rounded-lg border border-foreground/10 bg-foreground/5 px-1.5 py-1 text-center text-xs text-foreground outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => { setEditingVol(kw.id); setVolInput(kw.volume ? String(kw.volume) : ""); }}
                      className={`rounded-lg px-2 py-1 text-xs font-medium hover:bg-emerald-500/10 ${kw.volume ? "text-foreground" : "text-foreground/55"}`}
                      title="Click to edit search volume"
                    >
                      {fmtVol(kw.volume)}
                    </button>
                  )}
                </div>
                <div className="flex justify-center"><PositionBadge position={kw.position} /></div>
                <div className="flex justify-center"><ChangeIndicator change={kw.change} /></div>
                <div>
                  {kw.rank_url ? (
                    <a href={kw.rank_url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-emerald-500 hover:underline">
                      {pathOf(kw.rank_url)}
                    </a>
                  ) : (
                    <span className="text-xs text-foreground/30">—</span>
                  )}
                </div>
                <div className="text-center text-xs text-foreground/55">{timeAgo(kw.checked_at)}</div>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleRunSingle(kw.id)}
                    disabled={checkingSingle === kw.id || checking}
                    className="rounded-lg p-2 text-emerald-500 transition-colors hover:bg-emerald-500/10 disabled:opacity-40"
                    title="Check this keyword"
                  >
                    {checkingSingle === kw.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(kw.id)}
                    className="rounded-lg p-2 text-red-400 opacity-0 transition-all hover:bg-red-500/10 group-hover:opacity-100"
                    title="Remove keyword"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {keywords.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          {[
            { label: "Top 3", bg: "linear-gradient(135deg,#fbbf24,#f59e0b)" },
            { label: "4-10", bg: "linear-gradient(135deg,#34d399,#10b981)" },
            { label: "11-30", bg: "linear-gradient(135deg,#60a5fa,#3b82f6)" },
            { label: "31-50", bg: "linear-gradient(135deg,#fb923c,#f97316)" },
            { label: "50+", bg: "linear-gradient(135deg,#f87171,#ef4444)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ background: l.bg }} />
              <span className="text-xs text-foreground/55">{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
