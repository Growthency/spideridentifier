import { Globe } from "lucide-react";
import { gscConfigured, gscSearchAnalytics, type GscRow } from "@/lib/google";
import { getBlogPosts, getSpecies } from "@/lib/data";
import { siteConfig } from "@/lib/site";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { IndexingTable } from "@/components/admin/IndexingTable";

export const dynamic = "force-dynamic";

const date = (offsetDays: number) => new Date(Date.now() - offsetDays * 86400000).toISOString().slice(0, 10);

export default async function IndexingReportAdmin() {
  // Every indexable URL, the same set the sitemap publishes.
  const [posts, species] = await Promise.all([getBlogPosts(), getSpecies()]);
  const staticRoutes = ["", "/species", "/anatomy", "/blog", "/pricing", "/about", "/contact", "/privacy", "/terms", "/refund", "/disclaimer"];
  const urls = [
    ...staticRoutes.map((p) => `${siteConfig.url}${p}`),
    ...posts.map((p) => `${siteConfig.url}/blog/${p.slug}`),
    ...species.map((s) => `${siteConfig.url}/species/${s.slug}`),
  ];

  // Pages Google actually served in the last 28 days — a URL with impressions
  // is certainly indexed, which saves inspection-API quota.
  let served: GscRow[] = [];
  if (gscConfigured) {
    try {
      served = await gscSearchAnalytics({
        startDate: date(28),
        endDate: date(1),
        dimensions: ["page"],
        rowLimit: 500,
      });
    } catch {
      served = [];
    }
  }
  const servedSet = new Set(served.map((r) => (r.keys?.[0] ?? "").replace(/\/$/, "")));

  const rows = urls.map((url) => ({
    url,
    path: url.replace(siteConfig.url, "") || "/",
    indexedByTraffic: servedSet.has(url.replace(/\/$/, "")),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        icon={Globe}
        title="Indexing Report"
        subtitle={`${urls.length} indexable URLs · ${gscConfigured ? `${servedSet.size} confirmed in Google via search traffic` : "connect Search Console for live index status"}`}
      />

      {!gscConfigured && (
        <div className="mb-6 rounded-xl border border-foreground/8 bg-card p-8 text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Connect Search Console</h2>
          <p className="mx-auto max-w-md text-sm text-foreground/55">
            Add <code className="text-[rgb(var(--gold-soft))]">GSC_SITE_URL</code> plus the Google service-account keys
            (guide in <code className="text-[rgb(var(--gold-soft))]">.env.example</code>) to check each URL&apos;s index
            status with one click.
          </p>
        </div>
      )}

      <IndexingTable rows={rows} gscConfigured={gscConfigured} />
    </div>
  );
}
