"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Article search box — submits to the blog index with a query. */
export function SidebarSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/blog?q=${encodeURIComponent(q.trim())}` : "/blog");
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles"
        className="w-full rounded-2xl border border-foreground/10 bg-card/70 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none"
      />
    </form>
  );
}
