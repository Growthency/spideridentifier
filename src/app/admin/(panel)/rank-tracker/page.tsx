import { Trophy } from "lucide-react";
import { gscConfigured, gscSearchAnalytics, type GscRow } from "@/lib/google";
import { getSiteContent } from "@/lib/siteContent";
import { serpApiConfigured, getSerpQuota } from "@/lib/serpapi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RankTrackerLive } from "@/components/admin/RankTrackerLive";

export const dynamic = "force-dynamic";

interface RankCheck {
  position: number | null;
  url: string | null;
  prev_position: number | null;
  checked_at: string;
}

function fmtPos(p: number) {
  return p ? p.toFixed(1) : "—";
}
function fmtCtr(c: number) {
  return `${(c * 100).toFixed(1)}%`;
}

const date = (offsetDays: number) => new Date(Date.now() - offsetDays * 86400000).toISOString().slice(0, 10);

export default async function RankTrackerAdmin() {
  const [tracked, checks, quota] = await Promise.all([
    getSiteContent<string[]>("tracked_keywords", []),
    getSiteContent<Record<string, RankCheck>>("rank_checks", {}),
    serpApiConfigured ? getSerpQuota() : Promise.resolve(null),
  ]);

  let rows: GscRow[] = [];
  let gscError = false;
  if (gscConfigured) {
    try {
      rows = await gscSearchAnalytics({
        startDate: date(28),
        endDate: date(1),
        dimensions: ["query"],
        rowLimit: 100,
      });
    } catch {
      gscError = true;
    }
  }

  // GSC stats keyed by query, serializable for the client panel
  const gscByKeyword: Record<string, { position: number; clicks: number; impressions: number; ctr: number }> = {};
  for (const r of rows) {
    const q = r.keys?.[0];
    if (q) gscByKeyword[q] = { position: r.position, clicks: r.clicks, impressions: r.impressions, ctr: r.ctr };
  }

  const posColor = (p?: number) =>
    !p ? "text-foreground/40" : p <= 3 ? "text-emerald-500" : p <= 10 ? "text-amber-500" : "text-red-400";

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        icon={Trophy}
        title="Rank Tracker"
        subtitle="Live Google positions (SerpApi) + 28-day Search Console data for your keywords."
      />

      {gscError && (
        <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          Search Console request failed — check that the service account has access to the property.
        </p>
      )}

      {/* Tracked keywords with live checks */}
      <RankTrackerLive tracked={tracked} checks={checks} gsc={gscByKeyword} serpConfigured={serpApiConfigured} quota={quota} />

      {/* Top queries from Search Console */}
      <h2 className="mb-3 text-base font-semibold text-foreground">Top 100 queries (Search Console)</h2>
      <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-foreground/45">
            {gscConfigured
              ? "No query data yet — give Google a few days after launch."
              : "Connect Search Console (Google keys in .env) to see queries."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.02] text-left text-xs uppercase tracking-wide text-foreground/45">
              <tr>
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Query</th>
                <th className="p-4 text-right font-medium">Position</th>
                <th className="p-4 text-right font-medium">Clicks</th>
                <th className="hidden p-4 text-right font-medium sm:table-cell">Impressions</th>
                <th className="hidden p-4 text-right font-medium md:table-cell">CTR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.keys?.[0] ?? i} className="border-t border-foreground/8">
                  <td className="p-4 text-xs font-bold text-foreground/35">{i + 1}</td>
                  <td className="max-w-xs truncate p-4 font-medium text-foreground">{r.keys?.[0]}</td>
                  <td className={`p-4 text-right font-bold ${posColor(r.position)}`}>{fmtPos(r.position)}</td>
                  <td className="p-4 text-right text-foreground/70">{r.clicks}</td>
                  <td className="hidden p-4 text-right text-foreground/70 sm:table-cell">{r.impressions}</td>
                  <td className="hidden p-4 text-right text-foreground/60 md:table-cell">{fmtCtr(r.ctr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
