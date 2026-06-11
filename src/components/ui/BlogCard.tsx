import Link from "next/link";
import { ArrowUpRight, Clock, Calendar } from "lucide-react";
import { BlogMedia } from "@/components/ui/BlogMedia";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const accent = post.cover_accent === "crimson" ? "crimson" : "gold";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-foreground/8 bg-card/60 transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-card",
        featured && "md:flex-row"
      )}
    >
      <div className={cn("relative", featured ? "h-52 md:h-auto md:w-2/5" : "h-44")}>
        <BlogMedia slug={post.slug} accent={accent} alt={post.title} className="h-full min-h-44 w-full transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-[rgb(var(--gold-soft))] backdrop-blur">
          {post.category}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/70 backdrop-blur">
          {post.level}
        </span>
      </div>

      <div className={cn("flex flex-1 flex-col p-6", featured && "md:justify-center md:p-8")}>
        <div className="flex items-center gap-3 text-xs text-foreground/45">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.read_time} min read
          </span>
        </div>
        <h3
          className={cn(
            "mt-2 font-display font-bold leading-snug transition-colors group-hover:text-gold",
            featured ? "text-2xl" : "text-lg"
          )}
        >
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/60">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-ink-950">
              {post.author_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>
            <div className="leading-tight">
              <p className="text-xs font-medium text-foreground/80">{post.author_name}</p>
              <p className="text-[11px] text-foreground/45">{post.author_role}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-gold opacity-0 transition-opacity group-hover:opacity-100">
            Read <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
