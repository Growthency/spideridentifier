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
} from "lucide-react";
import { getAnalyticsSummary, ga4Configured, gscConfigured, gscSearchAnalytics } from "@/lib/google";
import { ClearCacheButton } from "@/components/admin/ClearCacheButton";
import { DashboardFilters, PERIOD_LABELS, CHART_LABELS } from "@/components/admin/DashboardFilters";

export const revalidate = 600;

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

  let data = null;
  let loadError = false;
  let clicksDaily: { date: string; clicks: number }[] = [];
  try {
    [data, clicksDaily] = await Promise.all([
      getAnalyticsSummary(start, end),
      gscConfigured
        ? gscSearchAnalytics({ startDate: start, endDate: end, dimensions: ["date"], rowLimit: 1000 }).then((rows) =>
            rows.map((r) => ({ date: (r.keys?.[0] ?? "").replace(/-/g, ""), clicks: r.clicks }))
          )
        : Promise.resolve([]),
    ]);
  } catch {
    loadError = true;
  }

  const fmt = (v: number) => v.toLocaleString("en-US");
  const maxViews = data?.topPages[0]?.views || 1;
  const maxUsers = data?.topCountries[0]?.users || 1;

  // merge GA users + GSC clicks per day for the chart
  const clickMap = new Map(clicksDaily.map((c) => [c.date, c.clicks]));
  const merged = bucketize(
    (data?.daily ?? []).map((d) => ({ date: d.date, users: d.users, clicks: clickMap.get(d.date) ?? 0 }))
  );
  const chartMax = Math.max(
    1,
    ...merged.map((d) => (chartKey === "users" ? d.users : chartKey === "clicks" ? d.clicks : Math.max(d.users, d.clicks)))
  );
  const prettyDate = (yyyymmdd: string) => {
    if (yyyymmdd.length !== 8) return yyyymmdd;
    return new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
          <DashboardFilters period={periodKey} chart={chartKey} />
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
      {ga4Configured && loadError && (
        <div className="mb-6 rounded-xl border border-foreground/8 bg-card p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Analytics are connecting…</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Live Google Analytics data will appear here automatically once access finishes setting up. Newly granted
            permissions can take a little while to take effect — use Clear Cache to refresh.
          </p>
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
          <span className="text-xs text-foreground/45">{chartKey === "both" ? "GA4 + GSC" : chartKey === "clicks" ? "from Search Console" : "from Google Analytics"}</span>
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

        {merged.length > 0 ? (
          <div>
            <div className="flex h-48 items-end gap-[3px]">
              {merged.map((d) =>
                chartKey === "both" ? (
                  <div key={d.date} title={`${prettyDate(d.date)}: ${fmt(d.users)} users · ${fmt(d.clicks)} clicks`} className="flex flex-1 items-end gap-[1px]">
                    <div
                      className="flex-1 rounded-t-sm bg-emerald-400/85 transition-colors hover:bg-emerald-500"
                      style={{ height: `${Math.max(2, (d.users / chartMax) * 100)}%` }}
                    />
                    <div
                      className="flex-1 rounded-t-sm bg-sky-400/85 transition-colors hover:bg-sky-500"
                      style={{ height: `${Math.max(2, (d.clicks / chartMax) * 100)}%` }}
                    />
                  </div>
                ) : (
                  <div
                    key={d.date}
                    title={`${prettyDate(d.date)}: ${fmt(chartKey === "clicks" ? d.clicks : d.users)} ${chartKey === "clicks" ? "clicks" : "users"}`}
                    className={`flex-1 rounded-t-md transition-colors ${
                      chartKey === "clicks" ? "bg-sky-400/85 hover:bg-sky-500" : "bg-emerald-400/80 hover:bg-emerald-500"
                    }`}
                    style={{ height: `${Math.max(3, ((chartKey === "clicks" ? d.clicks : d.users) / chartMax) * 100)}%` }}
                  />
                )
              )}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-foreground/40">
              <span>{prettyDate(merged[0]?.date ?? "")}</span>
              <span>{prettyDate(merged[merged.length - 1]?.date ?? "")}</span>
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-foreground/40">No traffic data yet.</p>
        )}
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
            <ul>
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
            <ul>
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
    </div>
  );
}
