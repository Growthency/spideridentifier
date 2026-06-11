"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Tag, BarChart3, Globe, Star } from "lucide-react";
import { BlogCard } from "@/components/ui/BlogCard";
import { FilterDropdown } from "@/components/blog/FilterDropdown";
import { Pagination } from "@/components/blog/Pagination";
import type { BlogPost } from "@/lib/types";

const FIRST_PAGE_GRID = 6; // posts under the featured card on page 1
const PER_PAGE = 9; // posts per page from page 2 onward (and when filtering)

export function BlogExplorer({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(
    () => ["All categories", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  );
  const levels = useMemo(() => ["All levels", ...Array.from(new Set(posts.map((p) => p.level)))], [posts]);
  const regions = useMemo(() => ["All regions", ...Array.from(new Set(posts.map((p) => p.region)))], [posts]);

  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [level, setLevel] = useState(levels[0]);
  const [region, setRegion] = useState(regions[0]);
  const [page, setPage] = useState(1);

  const isDefault =
    !query && category === categories[0] && level === levels[0] && region === regions[0];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return posts.filter((p) => {
      const okCat = category === categories[0] || p.category === category;
      const okLvl = level === levels[0] || p.level === level;
      const okReg = region === regions[0] || p.region === region;
      const okQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return okCat && okLvl && okReg && okQ;
    });
  }, [posts, query, category, level, region, categories, levels, regions]);

  useEffect(() => setPage(1), [query, category, level, region]);

  // ---- decide featured + grid for the current page ----
  let featured: BlogPost | null = null;
  let grid: BlogPost[] = [];
  let pageCount = 1;
  const total = isDefault ? posts.length : filtered.length;

  if (isDefault) {
    const top = posts.find((p) => p.is_featured) ?? posts[0];
    const rest = posts.filter((p) => p.slug !== top.slug);
    pageCount = rest.length <= FIRST_PAGE_GRID ? 1 : 1 + Math.ceil((rest.length - FIRST_PAGE_GRID) / PER_PAGE);
    if (page === 1) {
      featured = top;
      grid = rest.slice(0, FIRST_PAGE_GRID);
    } else {
      const start = FIRST_PAGE_GRID + (page - 2) * PER_PAGE;
      grid = rest.slice(start, start + PER_PAGE);
    }
  } else {
    pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    grid = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  }

  const shown = (featured ? 1 : 0) + grid.length;

  return (
    <div>
      {/* filter bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-foreground/10 bg-card/50 p-3 lg:flex-row lg:items-center">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(draft); }} className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search guides — black widow, web, bite…"
            className="h-11 w-full rounded-full border border-foreground/10 bg-foreground/5 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none"
          />
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown icon={Tag} value={category} options={categories} onChange={setCategory} />
          <FilterDropdown icon={BarChart3} value={level} options={levels} onChange={setLevel} />
          <FilterDropdown icon={Globe} value={region} options={regions} onChange={setRegion} />
          <button
            type="button"
            onClick={() => setQuery(draft)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm text-foreground/55">
        Showing <span className="font-semibold text-foreground">{shown}</span> of{" "}
        <span className="font-semibold text-foreground">{total}</span> {total === 1 ? "article" : "articles"}
      </p>

      {total === 0 ? (
        <p className="py-20 text-center text-foreground/50">No guides match your filters yet.</p>
      ) : (
        <div className="mt-6 space-y-8">
          {/* featured (top-ranked) */}
          {featured && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold-soft))]">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" /> Featured guide
              </div>
              <BlogCard post={featured} featured />
            </motion.div>
          )}

          {/* grid */}
          {grid.length > 0 && (
            <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((p) => (
                <motion.div key={p.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <BlogCard post={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        onChange={(p) => {
          setPage(p);
          if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
