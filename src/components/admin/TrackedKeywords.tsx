"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";

/** Pin keywords to the top of the rank tracker. Stored in site_content. */
export function TrackedKeywords({ tracked }: { tracked: string[] }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const { call, saving, error } = useSiteAdmin();

  async function save(next: string[]) {
    const ok = await call({ action: "set_content", key: "tracked_keywords", value: next });
    if (ok) router.refresh();
  }

  return (
    <div className="mb-5 rounded-xl border border-foreground/8 bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Track a keyword (e.g. spider identifier)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && keyword.trim()) save([...new Set([...tracked, keyword.trim().toLowerCase()])]);
          }}
          className="min-w-[240px] flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground focus:border-gold/50 focus:outline-none"
        />
        <button
          onClick={() => keyword.trim() && save([...new Set([...tracked, keyword.trim().toLowerCase()])])}
          disabled={saving || !keyword.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Track
        </button>
      </div>
      {tracked.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tracked.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600">
              {k}
              <button onClick={() => save(tracked.filter((t) => t !== k))} aria-label={`Stop tracking ${k}`} className="hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
