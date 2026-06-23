"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export interface ChartPoint {
  date: string; // YYYYMMDD
  users: number;
  clicks: number;
}

const fmt = (v: number) => v.toLocaleString("en-US");

function prettyDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Search Console has no data yet — explain instead of showing an empty chart. */
function NoSearchData() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <Search className="h-9 w-9 text-foreground/20" />
      <p className="text-sm font-semibold text-foreground/70">No Search Console clicks yet</p>
      <p className="max-w-md text-xs leading-relaxed text-foreground/45">
        Google is still gathering search data for this site. New sites usually take a few weeks before clicks,
        impressions and keywords show up. Your visitor analytics (Daily Active Users) are already live above.
      </p>
    </div>
  );
}

/** Daily bar chart with a hover tooltip — users, clicks, or both. */
export function DashboardChart({ points, mode }: { points: ChartPoint[]; mode: "users" | "clicks" | "both" }) {
  const [hover, setHover] = useState<number | null>(null);

  if (points.length === 0) {
    return <p className="py-12 text-center text-sm text-foreground/40">No traffic data yet.</p>;
  }

  const totalClicks = points.reduce((s, p) => s + p.clicks, 0);
  // Clicks-only view with zero Search Console data → clear explanation.
  if (mode === "clicks" && totalClicks === 0) return <NoSearchData />;

  const max = Math.max(
    1,
    ...points.map((p) => (mode === "users" ? p.users : mode === "clicks" ? p.clicks : Math.max(p.users, p.clicks)))
  );
  const h = (v: number) => `${Math.max(2, (v / max) * 100)}%`;
  const active = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      {/* hover tooltip */}
      {active && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-2 rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs shadow-lg"
          style={{ left: `${((hover! + 0.5) / points.length) * 100}%` }}
        >
          <div className="whitespace-nowrap font-semibold text-foreground">{prettyDate(active.date)}</div>
          {mode !== "clicks" && (
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="h-2 w-2 rounded-sm bg-emerald-400" /> {fmt(active.users)} users
            </div>
          )}
          {mode !== "users" && (
            <div className="flex items-center gap-1.5 text-sky-500">
              <span className="h-2 w-2 rounded-sm bg-sky-400" /> {fmt(active.clicks)} clicks
            </div>
          )}
        </div>
      )}

      <div className="flex h-48 items-end gap-[3px]">
        {points.map((d, i) => (
          <div
            key={d.date}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((cur) => (cur === i ? null : cur))}
            className={`flex h-full flex-1 cursor-default items-end gap-[1px] rounded-t-sm transition-colors ${
              hover === i ? "bg-foreground/5" : ""
            }`}
          >
            {mode !== "clicks" && (
              <div className="flex-1 rounded-t-sm bg-emerald-400/85 transition-colors hover:bg-emerald-500" style={{ height: h(d.users) }} />
            )}
            {mode !== "users" && (
              <div className="flex-1 rounded-t-sm bg-sky-400/85 transition-colors hover:bg-sky-500" style={{ height: h(d.clicks) }} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-foreground/40">
        <span>{prettyDate(points[0]?.date ?? "")}</span>
        <span>{prettyDate(points[points.length - 1]?.date ?? "")}</span>
      </div>

      {/* In the combined view, note when Search Console has no clicks yet. */}
      {mode === "both" && totalClicks === 0 && (
        <p className="mt-3 rounded-lg bg-amber-500/8 px-3 py-2 text-center text-[11px] leading-relaxed text-amber-600">
          Search Console clicks: none yet — Google is still collecting search data for this new site (usually a few
          weeks). Only the green Analytics users are plotted for now.
        </p>
      )}
    </div>
  );
}
