import Link from "next/link";
import { Eye, TrendingUp, Clock, Sparkles, Check, ChevronRight, Star } from "lucide-react";
import { BlogMedia } from "@/components/ui/BlogMedia";
import { SidebarSearch } from "@/components/blog/SidebarSearch";
import { createPublicClient, publicConfigured } from "@/lib/supabase/public";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

async function getViewCounts(): Promise<Map<string, number>> {
  if (!publicConfigured) return new Map();
  try {
    const supabase = createPublicClient();
    const { data } = await supabase!.from("post_views").select("slug, views").order("views", { ascending: false }).limit(50);
    return new Map((data ?? []).map((r: { slug: string; views: number }) => [r.slug, Number(r.views)]));
  } catch {
    return new Map();
  }
}

/** Right-hand article sidebar: search, author, popular, premium CTA, recent. */
export async function PostSidebar({ current, posts }: { current: BlogPost; posts: BlogPost[] }) {
  const views = await getViewCounts();

  const popular = [...posts]
    .sort((a, b) => (views.get(b.slug) ?? 0) - (views.get(a.slug) ?? 0))
    .slice(0, 10);

  const recent = [...posts]
    .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
    .slice(0, 6);

  const card = "rounded-3xl border border-foreground/8 bg-card/70 overflow-hidden";

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      {/* search */}
      <SidebarSearch />

      {/* author card */}
      <div className={`${card} p-6 text-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.author_avatar || "/images/authors/default-author.webp"}
          alt={current.author_name}
          className="mx-auto mb-4 h-32 w-32 rounded-full object-cover ring-4 ring-gold/40"
        />
        <h3 className="font-display text-lg font-bold text-foreground">{current.author_name}</h3>
        <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-[rgb(var(--gold-soft))]">
          <Sparkles className="h-3 w-3" /> {current.author_role}
        </span>
        <p className="mt-3 text-sm leading-relaxed text-foreground/60">
          Specialist in spider identification and bite safety. Every guide is research-checked so you can tell harmless
          house spiders from the medically significant ones.
        </p>
        <Link
          href="/about"
          className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-foreground/12 px-5 text-sm font-medium text-foreground/75 transition-colors hover:border-gold/40 hover:text-gold"
        >
          More about us <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* popular posts */}
      <div className={card}>
        <h3 className="flex items-center gap-2 border-b border-foreground/8 px-5 py-3.5 text-sm font-bold text-foreground">
          <TrendingUp className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Popular Posts
        </h3>
        <ul>
          {popular.map((p, i) => (
            <li key={p.slug} className="border-b border-foreground/5 last:border-0">
              <Link href={`/${p.slug}`} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.03]">
                <BlogMedia
                  slug={p.slug}
                  src={p.featured_image || undefined}
                  accent={p.cover_accent === "crimson" ? "crimson" : "gold"}
                  alt={p.title}
                  className="h-12 w-14 shrink-0 rounded-lg"
                  sizes="56px"
                />
                <span className="min-w-0">
                  <span className="block text-xs leading-snug text-foreground/85 group-hover:text-gold">
                    <strong className="mr-1 text-foreground/40">{String(i + 1).padStart(2, "0")}</strong>
                    <span className="line-clamp-2 inline">{p.title}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground/40">
                    <Eye className="h-3 w-3" /> {(views.get(p.slug) ?? 0).toLocaleString("en-US")} views
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* premium card */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full border border-amber-300/40 bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            ★ Premium
          </span>
          <span className="flex gap-0.5 text-amber-300">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug">Unlock All Premium Articles &amp; Features</h3>
        <p className="mt-1.5 text-xs text-white/70">
          Join the readers who identify spiders safely with expert-level access.
        </p>
        <ul className="mt-4 space-y-2 text-xs text-white/85">
          {[
            "All premium deep-dive articles",
            "Priority AI — faster identifications",
            "Expert safety write-ups & look-alike alerts",
            "Monthly credits — scan more spiders",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> {t}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-[11px] text-white/60">
          Starting from <strong className="text-white">$4.99/mo</strong>
        </p>
        <Link
          href="/pricing"
          className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
        >
          View Plans
        </Link>
        <p className="mt-3 text-center text-[10px] text-white/50">14-day money-back guarantee · cancel anytime</p>
      </div>

      {/* recent posts */}
      <div className={card}>
        <h3 className="flex items-center gap-2 border-b border-foreground/8 px-5 py-3.5 text-sm font-bold text-foreground">
          <Clock className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Recent Posts
        </h3>
        <ul>
          {recent.map((p) => (
            <li key={p.slug} className="border-b border-foreground/5 last:border-0">
              <Link href={`/${p.slug}`} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.03]">
                <BlogMedia
                  slug={p.slug}
                  src={p.featured_image || undefined}
                  accent={p.cover_accent === "crimson" ? "crimson" : "gold"}
                  alt={p.title}
                  className="h-12 w-14 shrink-0 rounded-lg"
                  sizes="56px"
                />
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-xs leading-snug text-foreground/85 group-hover:text-gold">{p.title}</span>
                  <span className="mt-0.5 block text-[11px] text-foreground/40">{formatDate(p.published_at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
