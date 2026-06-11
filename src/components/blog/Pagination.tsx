"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function buildPages(page: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  const pages = buildPages(page, pageCount);

  const btn =
    "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-semibold transition-colors";

  return (
    <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={cn(btn, "gap-1 border-foreground/10 text-foreground/70 hover:border-gold/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40")}
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-1.5 text-foreground/40">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              btn,
              p === page
                ? "border-transparent bg-brand-gradient text-ink-950"
                : "border-foreground/10 text-foreground/70 hover:border-gold/40 hover:text-foreground"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className={cn(btn, "gap-1 border-foreground/10 text-foreground/70 hover:border-gold/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40")}
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
