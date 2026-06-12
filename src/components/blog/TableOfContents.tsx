"use client";

import { useState } from "react";
import { ListOrdered, ChevronDown } from "lucide-react";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Collapsible table of contents with anchor links (mushroom-style). */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  if (items.length < 2) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-foreground/10 bg-card/70">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ListOrdered className="h-4 w-4 text-[rgb(var(--gold-soft))]" />
          Table of Contents
          <span className="rounded-md bg-gold/10 px-1.5 py-0.5 text-xs font-bold text-[rgb(var(--gold-soft))]">{items.length}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-foreground/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ol className="space-y-1.5 border-t border-foreground/8 px-5 py-4">
          {items.map((it, i) => (
            <li key={it.id} className={it.level === 3 ? "ml-5" : ""}>
              <a href={`#${it.id}`} className="flex gap-2 text-sm text-foreground/70 transition-colors hover:text-gold">
                {it.level === 2 && <span className="shrink-0 font-semibold text-foreground/40">{i + 1}.</span>}
                <span>{it.text}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
