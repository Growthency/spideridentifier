/**
 * Period / chart option maps for the admin dashboard.
 *
 * Deliberately a plain module (NO "use client"): the dashboard server page
 * validates searchParams against these maps. When they lived inside the
 * "use client" DashboardFilters file, the server import became a client
 * reference stub — every lookup returned undefined, so the validation
 * silently reset any selected period/chart back to the defaults.
 */
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
