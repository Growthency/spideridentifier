"use client";

import { useMemo, useState } from "react";
import { Search, Globe, Lock, Link2 } from "lucide-react";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { formatDate } from "@/lib/utils";

export interface PageRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  access_type: string;
  status: string;
  published_at: string | null;
  is_featured: boolean;
  views: number;
  links: number;
}

type Tab = "all" | "published" | "draft" | "scheduled";

/** Published posts dated in the future are scheduled — they go live automatically. */
function effectiveStatus(row: PageRow): "published" | "draft" | "scheduled" {
  if (row.status === "published" && row.published_at && +new Date(row.published_at) > Date.now()) return "scheduled";
  return row.status === "published" ? "published" : "draft";
}

const TABS: { key: Tab; label: string; dot: string }[] = [
  { key: "all", label: "All", dot: "" },
  { key: "published", label: "Published", dot: "bg-emerald-500" },
  { key: "draft", label: "Draft", dot: "bg-amber-400" },
  { key: "scheduled", label: "Scheduled", dot: "bg-sky-500" },
];

const STATUS_PILL: Record<string, string> = {
  published: "bg-emerald-500/12 text-emerald-600",
  draft: "bg-amber-400/15 text-amber-600",
  scheduled: "bg-sky-500/12 text-sky-600",
};

export function PagesTable({ rows }: { rows: PageRow[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const withStatus = useMemo(() => rows.map((r) => ({ ...r, eff: effectiveStatus(r) })), [rows]);

  const counts = useMemo(
    () => ({
      all: withStatus.length,
      published: withStatus.filter((r) => r.eff === "published").length,
      draft: withStatus.filter((r) => r.eff === "draft").length,
      scheduled: withStatus.filter((r) => r.eff === "scheduled").length,
    }),
    [withStatus]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withStatus.filter((r) => {
      const okTab = tab === "all" || r.eff === tab;
      const okQ = !q || r.title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      return okTab && okQ;
    });
  }, [withStatus, tab, query]);

  return (
    <div>
      {/* status tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                active
                  ? "border-transparent bg-foreground text-background"
                  : "border-foreground/12 bg-card text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {t.dot && <span className={`h-2 w-2 rounded-full ${t.dot}`} />}
              {t.label}
              <span className={active ? "text-background/70" : "text-foreground/45"}>{counts[t.key]}</span>
            </button>
          );
        })}
      </div>

      {/* search */}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="h-12 w-full rounded-2xl border border-foreground/10 bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none"
        />
      </div>

      {/* table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-foreground/8">
        <table className="w-full text-sm">
          <thead className="bg-foreground/[0.02] text-left text-xs uppercase tracking-wide text-foreground/45">
            <tr>
              <th className="p-4 font-medium">Title</th>
              <th className="hidden p-4 font-medium md:table-cell">Category</th>
              <th className="hidden p-4 font-medium lg:table-cell">Type</th>
              <th className="hidden p-4 font-medium sm:table-cell">Status</th>
              <th className="hidden p-4 font-medium lg:table-cell">Date</th>
              <th className="hidden p-4 font-medium xl:table-cell">Views</th>
              <th className="hidden p-4 font-medium xl:table-cell">Links</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-sm text-foreground/45">
                  No articles match{query ? ` “${query}”` : " this filter"}.
                </td>
              </tr>
            ) : (
              visible.map((p) => (
                <tr key={p.id} className="border-t border-foreground/8">
                  <td className="max-w-xs p-4">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="mt-0.5 truncate text-xs text-foreground/40">/{p.slug}</p>
                    {p.is_featured && <span className="text-xs text-gold">★ Featured</span>}
                  </td>
                  <td className="hidden p-4 text-foreground/65 md:table-cell">{p.category}</td>
                  <td className="hidden p-4 lg:table-cell">
                    {p.access_type === "premium" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-600">
                        <Lock className="h-3 w-3" /> Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.03] px-2.5 py-1 text-xs font-medium text-foreground/65">
                        <Globe className="h-3 w-3" /> Free
                      </span>
                    )}
                  </td>
                  <td className="hidden p-4 sm:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL[p.eff]}`}>{p.eff}</span>
                  </td>
                  <td className="hidden whitespace-nowrap p-4 text-foreground/50 lg:table-cell">{p.published_at ? formatDate(p.published_at) : "—"}</td>
                  <td className="hidden p-4 text-foreground/65 xl:table-cell">{p.views}</td>
                  <td className="hidden p-4 xl:table-cell">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600">
                      <Link2 className="h-3 w-3" /> {p.links}
                    </span>
                  </td>
                  <td className="p-4">
                    <PostRowActions id={p.id} slug={p.slug} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
