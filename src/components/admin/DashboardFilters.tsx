"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
 * Soft navigation — updates the URL's searchParams in place so the dashboard
 * re-renders with the new period/chart WITHOUT a full page reload. The page is
 * force-dynamic, so the server always renders fresh data for the selection.
 */

/** Date-range dropdown (page header). */
export function PeriodFilter({ period, chart }: { period: string; chart: string }) {
  const router = useRouter();
  return (
    <Dropdown
      icon={Calendar}
      value={period}
      options={PERIOD_LABELS}
      onSelect={(p) => router.push(`/admin?period=${p}&chart=${chart}`, { scroll: false })}
    />
  );
}

/** Chart-type dropdown (sits on the chart card). */
export function ChartFilter({ period, chart }: { period: string; chart: string }) {
  const router = useRouter();
  return (
    <Dropdown
      icon={BarChart3}
      value={chart}
      options={CHART_LABELS}
      onSelect={(c) => router.push(`/admin?period=${period}&chart=${c}`, { scroll: false })}
    />
  );
}
