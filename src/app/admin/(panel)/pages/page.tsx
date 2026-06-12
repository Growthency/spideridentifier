import Link from "next/link";
import { PlusCircle, FileText } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PagesTable, type PageRow } from "@/components/admin/PagesTable";
import { siteConfig } from "@/lib/site";
import type { BlogPost } from "@/lib/types";

/** Internal links inside the article body (HTML href or markdown links). */
function countInternalLinks(content: string): number {
  const hrefs = [...content.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const mdLinks = [...content.matchAll(/\]\((\/[^)\s]+)\)/g)].map((m) => m[1]);
  return [...hrefs, ...mdLinks].filter((h) => h && (h.startsWith("/") || h.startsWith(siteConfig.url))).length;
}

async function getRows(): Promise<PageRow[] | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  let posts: BlogPost[] = [];
  try {
    const { data } = await supabase.from("blog_posts").select("*").order("published_at", { ascending: false });
    posts = (data as BlogPost[]) ?? [];
  } catch {
    return [];
  }

  const viewMap = new Map<string, number>();
  try {
    const { data } = await supabase.from("post_views").select("slug, views");
    for (const v of data ?? []) viewMap.set(v.slug as string, Number(v.views) || 0);
  } catch {
    // views table missing — counts just show 0
  }

  return posts.map((p) => ({
    id: p.id!,
    slug: p.slug,
    title: p.title,
    category: p.category,
    access_type: p.access_type ?? "free",
    status: p.status,
    published_at: p.published_at ?? null,
    is_featured: Boolean(p.is_featured),
    views: viewMap.get(p.slug) ?? 0,
    links: countInternalLinks(p.content ?? ""),
  }));
}

export default async function AdminPostsPage() {
  const rows = await getRows();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Pages</h1>
          <p className="mt-1 text-sm text-foreground/55">Create, edit and publish your articles and guides.</p>
        </div>
        <Link href="/admin/pages/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950">
          <PlusCircle className="h-4.5 w-4.5" /> New Page
        </Link>
      </div>

      {rows === null ? (
        <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-foreground/70">
          Configure Supabase in <code className="text-gold">.env.local</code> and run{" "}
          <code className="text-gold">supabase/00-run-everything.sql</code> to manage posts here.
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-3xl border border-foreground/8 bg-card/50 p-16 text-center">
          <FileText className="h-10 w-10 text-foreground/30" />
          <p className="mt-4 font-medium">No posts yet</p>
          <p className="mt-1 text-sm text-foreground/50">Write your first guide or run the seed script.</p>
          <Link href="/admin/pages/new" className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950">
            <PlusCircle className="h-4 w-4" /> New Page
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <PagesTable rows={rows} />
        </div>
      )}
    </div>
  );
}
