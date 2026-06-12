import { Trophy } from "lucide-react";
import { gscConfigured, gscSearchAnalytics, type GscRow } from "@/lib/google";
import { getSiteContent } from "@/lib/siteContent";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TrackedKeywords } from "@/components/admin/TrackedKeywords";

export const dynamic = "force-dynamic";

function fmtPos(p: number) {
  return p ? p.toFixed(1) : "—";
}
function fmtCtr(c: number) {
  return `${(c * 100).toFixed(1)}%`;
}

const date = (offsetDays: number) => new Date(Date.now() - offsetDays * 86400000).toISOString().slice(0, 10);

export default async function RankTrackerAdmin() {
  const tracked = await getSiteContent<string[]>("tracked_keywords", []);

  let rows: GscRow[] = [];
  let error = false;
  if (gscConfigured) {
    try {
      rows = await gscSearchAnalytics({
        startDate: date(28),
        endDate: date(1),
        dimensions: ["query"],
        rowLimit: 100,
      });
    } catch {
      error = true;
    }
  }

  const byQuery = new Map(rows.map((r) => [r.keys?.[0] ?? "", r]));
  const trackedRows = tracked.map((k) => ({ keyword: k, row: byQuery.get(k) ?? null }));

  const posColor = (p?: number) =>
    !p ? "text-foreground/40" : p <= 3 ? "text-emerald-500" : p <= 10 ? "text-amber-500" : "text-red-400";

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        icon={Trophy}
        title="Rank Tracker"
        subtitle="Google positions for your keywords — last 28 days from Search Console."
      />

      {!gscConfigured && (
        <div className="mb-6 rounded-xl border border-foreground/8 bg-card p-8 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Connect Search Console</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Add <code className="text-[rgb(var(--gold-soft))]">GSC_SITE_URL</code> plus the Google service-account keys
            to your environment (guide in <code className="text-[rgb(var(--gold-soft))]">.env.example</code>) and your
            rankings appear here.
          </p>
        </div>
      )}
      {error && (
        <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          Search Console request failed — check that the service account has access to the property.
        </p>
      )}

      {/* Tracked keywords */}
      <TrackedKeywords tracked={tracked} />
      {tracked.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-xl border border-foreground/8 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.02] text-left text-xs uppercase tracking-wide text-foreground/45">
              <tr>
                <th className="p-4 font-medium">Tracked keyword</th>
                <th className="p-4 text-right font-medium">Position</th>
                <th className="hidden p-4 text-right font-medium sm:table-cell">Clicks</th>
                <th className="hidden p-4 text-right font-medium sm:table-cell">Impressions</th>
                <th className="hidden p-4 text-right font-medium md:table-cell">CTR</th>
              </tr>
            </thead>
            <tbody>
              {trackedRows.map(({ keyword, row }) => (
                <tr key={keyword} className="border-t border-foreground/8">
                  <td className="p-4 font-medium text-foreground">{keyword}</td>
                  <td className={`p-4 text-right font-bold ${posColor(row?.position)}`}>{fmtPos(row?.position ?? 0)}</td>
                  <td className="hidden p-4 text-right text-foreground/70 sm:table-cell">{row?.clicks ?? 0}</td>
                  <td className="hidden p-4 text-right text-foreground/70 sm:table-cell">{row?.impressions ?? 0}</td>
                  <td className="hidden p-4 text-right text-foreground/60 md:table-cell">{fmtCtr(row?.ctr ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top queries */}
      <h2 className="mb-3 text-base font-semibold text-foreground">Top 100 queries</h2>
      <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-foreground/45">
            {gscConfigured ? "No query data yet — give Google a few days after launch." : "Connect Search Console to see queries."}
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
