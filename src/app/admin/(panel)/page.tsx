import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Eye,
  Layers,
  BarChart3,
  FileText,
  Globe,
  CheckCircle2,
  XCircle,
  Search,
  MousePointerClick,
} from "lucide-react";
import { getAnalyticsSummary, ga4Configured, gscConfigured, gscSearchAnalytics, type GscRow } from "@/lib/google";
import { ClearCacheButton } from "@/components/admin/ClearCacheButton";
import { PeriodFilter, ChartFilter } from "@/components/admin/DashboardFilters";
import { PERIOD_LABELS, CHART_LABELS } from "@/lib/dashboardOptions";
import { DashboardChart } from "@/components/admin/DashboardChart";

// Always render fresh so the period / chart dropdowns (URL searchParams) take
// effect — a cached page would ignore the selection.
export const dynamic = "force-dynamic";

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Resolve a period key to explicit GA4/GSC date strings + a short label. */
function resolvePeriod(key: string): { start: string; end: string; label: string; short: string } {
  const today = new Date();
  const end = iso(today);
  switch (key) {
    case "7d":
      return { start: iso(new Date(Date.now() - 7 * 86400000)), end, label: PERIOD_LABELS["7d"], short: "7d" };
    case "this_month":
      return {
        start: iso(new Date(today.getFullYear(), today.getMonth(), 1)),
        end,
        label: PERIOD_LABELS.this_month,
        short: "This Month",
      };
    case "last_month": {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: iso(first), end: iso(last), label: PERIOD_LABELS.last_month, short: "Last Month" };
    }
    case "365d":
      return { start: iso(new Date(Date.now() - 365 * 86400000)), end, label: PERIOD_LABELS["365d"], short: "365d" };
    case "lifetime":
      // earliest date the GA4 Data API accepts
      return { start: "2015-08-14", end, label: PERIOD_LABELS.lifetime, short: "Lifetime" };
    default:
      return { start: iso(new Date(Date.now() - 30 * 86400000)), end, label: PERIOD_LABELS["30d"], short: "30d" };
  }
}

/** Collapse long ranges into weekly buckets so the chart stays readable. */
function bucketize(points: { date: string; users: number; clicks: number }[]) {
  if (points.length <= 92) return points;
  const out: { date: string; users: number; clicks: number }[] = [];
  for (let i = 0; i < points.length; i += 7) {
    const week = points.slice(i, i + 7);
    out.push({
      date: week[0].date,
      users: week.reduce((s, p) => s + p.users, 0),
      clicks: week.reduce((s, p) => s + p.clicks, 0),
    });
  }
  return out;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-foreground/8 bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-medium text-foreground/55">{label}</p>
        <Icon className="h-4 w-4 text-[rgb(var(--gold-soft))]" />
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Chip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${ok ? "text-emerald-500" : "text-foreground/40"}`}
      title={ok ? `${label} connected` : `${label} not connected — add Google keys in .env`}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; chart?: string }>;
}) {
  const params = await searchParams;
  const periodKey = params.period && PERIOD_LABELS[params.period] ? params.period : "30d";
  const chartKey = params.chart && CHART_LABELS[params.chart] ? params.chart : "users";
  const { start, end, label: periodLabel, short } = resolvePeriod(periodKey);

  // GA4 and GSC are fetched independently — a failure in one must never zero
  // the other, and the real error is surfaced (admin-only) for diagnosis.
  let data: Awaited<ReturnType<typeof getAnalyticsSummary>> | null = null;
  let clicksDaily: { date: string; clicks: number }[] = [];
  let topQueries: GscRow[] = [];
  let topSearchPages: GscRow[] = [];
  let ga4Error = "";
  let gscError = "";

  if (ga4Configured) {
    try {
      data = await getAnalyticsSummary(start, end);
    } catch (e) {
      ga4Error = e instanceof Error ? e.message : "GA4 request failed";
    }
  }
  if (gscConfigured) {
    try {
      const [dailyRows, queryRows, pageRows] = await Promise.all([
        gscSearchAnalytics({ startDate: start, endDate: end, dimensions: ["date"], rowLimit: 1000 }),
        gscSearchAnalytics({ startDate: start, endDate: end, dimensions: ["query"], rowLimit: 25 }),
        gscSearchAnalytics({ startDate: start, endDate: end, dimensions: ["page"], rowLimit: 25 }),
      ]);
      clicksDaily = dailyRows.map((r) => ({ date: (r.keys?.[0] ?? "").replace(/-/g, ""), clicks: r.clicks }));
      topQueries = queryRows;
      topSearchPages = pageRows;
    } catch (e) {
      gscError = e instanceof Error ? e.message : "GSC request failed";
    }
  }

  const fmt = (v: number) => v.toLocaleString("en-US");
  const maxViews = data?.topPages[0]?.views || 1;
  const maxUsers = data?.topCountries[0]?.users || 1;

  // merge GA users + GSC clicks per day for the chart
  const clickMap = new Map(clicksDaily.map((c) => [c.date, c.clicks]));
  const merged = bucketize(
    (data?.daily ?? []).map((d) => ({ date: d.date, users: d.users, clicks: clickMap.get(d.date) ?? 0 }))
  );
  const path = (url: string) => {
    try {
      return new URL(url).pathname || "/";
    } catch {
      return url;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-foreground/55">Real-time data from Google Analytics &amp; Search Console</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ClearCacheButton />
          <PeriodFilter period={periodKey} chart={chartKey} />
          <Chip ok={ga4Configured} label="GA4 Connected" />
          <Chip ok={gscConfigured} label="Search Console" />
        </div>
      </div>

      {/* Not connected / error notice */}
      {!ga4Configured && (
        <div className="mb-6 rounded-xl border border-foreground/8 bg-card p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Connect Google Analytics</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Add <code className="text-[rgb(var(--gold-soft))]">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>,{" "}
            <code className="text-[rgb(var(--gold-soft))]">GOOGLE_PRIVATE_KEY</code> and{" "}
            <code className="text-[rgb(var(--gold-soft))]">GA4_PROPERTY_ID</code> to your environment — the step-by-step
            guide is in <code className="text-[rgb(var(--gold-soft))]">.env.example</code>. Live traffic appears here
            automatically.
          </p>
        </div>
      )}
      {ga4Configured && !data && (
        <div className="mb-6 rounded-xl border border-foreground/8 bg-card p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Analytics are connecting…</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Live Google Analytics data will appear here automatically once access finishes setting up. Newly granted
            permissions can take a little while to take effect — use Clear Cache to refresh.
          </p>
          {ga4Error && (
            <p className="mx-auto mt-4 max-w-2xl break-words rounded-lg bg-red-500/8 px-3 py-2 text-left font-mono text-[11px] leading-relaxed text-red-500/80">
              {ga4Error}
            </p>
          )}
        </div>
      )}
      {data && gscError && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-foreground/70">
          Search Console data is unavailable right now —{" "}
          <span className="break-words font-mono text-[11px] text-amber-600">{gscError}</span>
        </div>
      )}

      {/* Stat cards — row 1 */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={`Users (${short})`} value={fmt(data?.users30d ?? 0)} icon={Users} />
        <StatCard label="Users (7d)" value={fmt(data?.users7d ?? 0)} icon={Calendar} />
        <StatCard label="Today" value={fmt(data?.usersToday ?? 0)} icon={Clock} />
        <StatCard label={`New Users (${short})`} value={fmt(data?.newUsers30d ?? 0)} icon={TrendingUp} />
      </div>

      {/* Stat cards — row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={`Sessions (${short})`} value={fmt(data?.sessions30d ?? 0)} icon={Activity} />
        <StatCard label={`Page Views (${short})`} value={fmt(data?.pageViews30d ?? 0)} icon={Eye} />
        <StatCard label="Total Active Users" value={fmt(data?.users30d ?? 0)} icon={Layers} />
      </div>

      {/* Daily chart */}
      <div className="mb-6 rounded-xl border border-foreground/8 bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-[rgb(var(--gold-soft))]" />
            {CHART_LABELS[chartKey]} — {periodLabel}
          </h2>
          <div className="flex items-center gap-3">
            <ChartFilter period={periodKey} chart={chartKey} />
            <span className="hidden text-xs text-foreground/45 sm:inline">
              {chartKey === "both" ? "GA4 + GSC" : chartKey === "clicks" ? "from Search Console" : "from Google Analytics"}
            </span>
          </div>
        </div>

        {/* legend for the combined view */}
        {chartKey === "both" && (
          <div className="mb-3 flex items-center gap-4 text-xs text-foreground/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Users
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" /> Clicks
            </span>
          </div>
        )}

        <DashboardChart points={merged} mode={chartKey as "users" | "clicks" | "both"} />
      </div>

      {/* Top pages + Top countries */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
          <div className="flex items-center justify-between border-b border-foreground/8 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Top 25 Pages
            </h2>
            <span className="text-xs text-foreground/45">by pageviews</span>
          </div>
          {data && data.topPages.length > 0 ? (
            <ul className="max-h-[460px] overflow-y-auto">
              {data.topPages.map((p, i) => (
                <li key={`${p.path}-${i}`} className="border-b border-foreground/5 px-5 py-3 last:border-0">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-xs font-bold text-foreground/35">#{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{p.title || p.path}</p>
                      <p className="truncate text-xs text-foreground/45">{p.path}</p>
                      <div className="mt-1.5 h-1 rounded-full bg-foreground/5">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(p.views / maxViews) * 100}%` }} />
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[rgb(var(--gold-soft))]">
                      <Eye className="h-3 w-3" /> {fmt(p.views)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-foreground/40">No page data yet.</p>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
          <div className="flex items-center justify-between border-b border-foreground/8 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Globe className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Top 25 Countries
            </h2>
            <span className="text-xs text-foreground/45">by active users</span>
          </div>
          {data && data.topCountries.length > 0 ? (
            <ul className="max-h-[460px] overflow-y-auto">
              {data.topCountries.map((c, i) => (
                <li key={`${c.country}-${i}`} className="border-b border-foreground/5 px-5 py-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-foreground/35">#{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{c.country}</p>
                        <span className="shrink-0 text-xs font-semibold text-sky-500">{fmt(c.users)}</span>
                      </div>
                      <div className="mt-1.5 h-1 rounded-full bg-foreground/5">
                        <div className="h-full rounded-full bg-sky-400" style={{ width: `${(c.users / maxUsers) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-foreground/40">No country data yet.</p>
          )}
        </div>
      </div>

      {/* Top search keywords + search pages (Search Console) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top 25 Search Keywords */}
        <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
          <div className="flex items-center justify-between border-b border-foreground/8 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Search className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Top 25 Search Keywords
            </h2>
            <span className="text-xs text-foreground/45">Search Console</span>
          </div>
          {topQueries.length > 0 ? (
            <div className="max-h-[460px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card text-left text-[10px] uppercase tracking-wide text-foreground/40">
                  <tr className="border-b border-foreground/8">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="py-2 font-medium">Keyword</th>
                    <th className="px-2 py-2 text-right font-medium">Clicks</th>
                    <th className="px-2 py-2 text-right font-medium">Impr</th>
                    <th className="px-2 py-2 text-right font-medium">CTR</th>
                    <th className="px-3 py-2 text-right font-medium">Pos</th>
                  </tr>
                </thead>
                <tbody>
                  {topQueries.map((r, i) => (
                    <tr key={`${r.keys?.[0]}-${i}`} className="border-b border-foreground/5 last:border-0">
                      <td className="px-3 py-2.5 text-xs font-bold text-foreground/35">{i + 1}</td>
                      <td className="max-w-[160px] truncate py-2.5 font-medium text-foreground" title={r.keys?.[0]}>{r.keys?.[0]}</td>
                      <td className="px-2 py-2.5 text-right font-semibold text-emerald-500">{fmt(r.clicks)}</td>
                      <td className="px-2 py-2.5 text-right text-foreground/60">{fmt(r.impressions)}</td>
                      <td className="px-2 py-2.5 text-right text-foreground/60">{(r.ctr * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2.5 text-right text-foreground/60">{r.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-foreground/40">
              {gscConfigured ? "No search data yet — give Google a few days." : "Connect Search Console."}
            </p>
          )}
        </div>

        {/* Top 25 Search Pages */}
        <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
          <div className="flex items-center justify-between border-b border-foreground/8 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MousePointerClick className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Top 25 Search Pages
            </h2>
            <span className="text-xs text-foreground/45">by clicks</span>
          </div>
          {topSearchPages.length > 0 ? (
            <div className="max-h-[460px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card text-left text-[10px] uppercase tracking-wide text-foreground/40">
                  <tr className="border-b border-foreground/8">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="py-2 font-medium">Page</th>
                    <th className="px-2 py-2 text-right font-medium">Clicks</th>
                    <th className="px-2 py-2 text-right font-medium">Impr</th>
                    <th className="px-3 py-2 text-right font-medium">Pos</th>
                  </tr>
                </thead>
                <tbody>
                  {topSearchPages.map((r, i) => (
                    <tr key={`${r.keys?.[0]}-${i}`} className="border-b border-foreground/5 last:border-0">
                      <td className="px-3 py-2.5 text-xs font-bold text-foreground/35">{i + 1}</td>
                      <td className="max-w-[160px] truncate py-2.5 font-mono text-xs text-foreground" title={r.keys?.[0]}>{path(r.keys?.[0] ?? "")}</td>
                      <td className="px-2 py-2.5 text-right font-semibold text-sky-500">{fmt(r.clicks)}</td>
                      <td className="px-2 py-2.5 text-right text-foreground/60">{fmt(r.impressions)}</td>
                      <td className="px-3 py-2.5 text-right text-foreground/60">{r.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-foreground/40">
              {gscConfigured ? "No search data yet — give Google a few days." : "Connect Search Console."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
