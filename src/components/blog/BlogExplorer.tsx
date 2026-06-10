"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { BlogCard } from "@/components/ui/BlogCard";
import type { BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BlogExplorer({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  );
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = posts.filter((p) => {
    const matchesCat = cat === "All" || p.category === cat;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <div>
      <div className="mb-10 flex flex-col gap-5">
        <div className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides — black widow, web, bite…"
            className="h-12 w-full rounded-full border border-foreground/10 bg-foreground/5 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink-950" : "text-foreground/60 hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="blog-filter"
                    className="absolute inset-0 -z-10 rounded-full bg-brand-gradient"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-foreground/50">No guides match your search yet.</p>
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BlogCard post={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
