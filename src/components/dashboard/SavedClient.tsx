"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, ChevronLeft, ChevronRight, Heart, Trash2 } from "lucide-react";
import { BlogMedia } from "@/components/ui/BlogMedia";

export interface SavedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  accent: "gold" | "crimson";
  created_at: string;
}

const PER_PAGE = 12;

/** Mushroom-style saved-articles grid with pagination and remove buttons. */
export function SavedClient({ initial }: { initial: SavedArticle[] }) {
  const [articles, setArticles] = useState<SavedArticle[]>(initial);
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (id: string, slug: string) => {
    setRemoving(id);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setRemoving(null);
    }
  };

  const totalPages = Math.ceil(articles.length / PER_PAGE);
  const pageItems = articles.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10">
          <Bookmark className="h-5 w-5 text-[rgb(var(--gold-soft))]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Articles</h1>
          <p className="text-sm text-foreground/60">
            {articles.length} article{articles.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-foreground/8 bg-card p-16 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
            <Heart className="h-10 w-10 text-[rgb(var(--gold-soft))]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">No saved articles yet</h2>
          <p className="mb-6 text-sm text-foreground/60">Tap the heart icon on any blog article to save it here.</p>
          <Link href="/blog" className="rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-ink-950">
            Browse Articles
          </Link>
        </div>
      )}

      {/* Article grid — 4 per row */}
      {pageItems.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pageItems.map((article) => (
            <div key={article.id} className="group flex flex-col overflow-hidden rounded-2xl border border-foreground/8 bg-card">
              {/* Thumbnail */}
              <Link href={`/${article.slug}`} className="relative block h-40 shrink-0 overflow-hidden bg-foreground/5">
                <BlogMedia
                  slug={article.slug}
                  accent={article.accent}
                  alt={article.title}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </Link>

              {/* Body */}
              <div className="flex flex-1 flex-col p-4">
                {article.category && (
                  <span className="mb-2 self-start rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-[rgb(var(--gold-soft))]">
                    {article.category}
                  </span>
                )}
                <Link href={`/${article.slug}`}>
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-opacity hover:opacity-80">
                    {article.title}
                  </h3>
                </Link>
                <p className="mb-3 line-clamp-2 flex-1 text-xs text-foreground/60">{article.excerpt}</p>

                <div className="flex items-center justify-between border-t border-foreground/8 pt-2">
                  <span className="text-xs text-foreground/45">
                    {new Date(article.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => handleRemove(article.id, article.slug)}
                    disabled={removing === article.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                    title="Remove from saved"
                  >
                    {removing === article.id ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border border-red-400 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-card px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-80 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-10 w-10 rounded-lg text-sm font-semibold transition-all hover:opacity-80 ${
                page === n ? "bg-brand-gradient text-ink-950" : "border border-foreground/10 bg-card text-foreground"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-card px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-80 disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
