"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, BarChart3 } from "lucide-react";

export const PERIOD_LABELS: Record<string, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  this_month: "This Month",
  last_month: "Last Month",
  "365d": "Last 365 Days",
  lifetime: "Lifetime",
};

export const CHART_LABELS: Record<string, string> = {
  users: "Daily Active Users",
  clicks: "Daily Active Clicks",
  both: "Clicks vs Users",
};

function Dropdown({
  icon: Icon,
  value,
  options,
  onSelect,
}: {
  icon: React.ElementType;
  value: string;
  options: Record<string, string>;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/5"
      >
        <Icon className="h-3.5 w-3.5 text-[rgb(var(--gold-soft))]" />
        {options[value] ?? value}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-lg">
          {Object.entries(options).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                onSelect(key);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-xs font-medium transition-colors ${
                key === value ? "bg-emerald-500/12 text-emerald-500" : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hard navigation on purpose: router.push updates the URL but on the deployed
 * Worker the RSC payload comes back stale, so the dashboard kept showing the
 * old period/chart. A full document load always re-runs the force-dynamic page
 * with the new searchParams — verified working on production.
 */
const go = (period: string, chart: string) => window.location.assign(`/admin?period=${period}&chart=${chart}`);

/** Date-range dropdown (page header). */
export function PeriodFilter({ period, chart }: { period: string; chart: string }) {
  return <Dropdown icon={Calendar} value={period} options={PERIOD_LABELS} onSelect={(p) => go(p, chart)} />;
}

/** Chart-type dropdown (sits on the chart card). */
export function ChartFilter({ period, chart }: { period: string; chart: string }) {
  return <Dropdown icon={BarChart3} value={chart} options={CHART_LABELS} onSelect={(c) => go(period, c)} />;
}
