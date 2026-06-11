"use client";

import { useState } from "react";
import { Trash2, Loader2, History, Search, X, Calendar } from "lucide-react";
import { VenomBadge } from "@/components/ui/VenomBadge";
import { SpeciesArt } from "@/components/ui/SpeciesArt";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Analysis } from "@/lib/types";

export function HistoryClient({ initial }: { initial: Analysis[] }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [active, setActive] = useState<Analysis | null>(null);

  const filtered = items.filter((a) => {
    const q = query.toLowerCase();
    return (
      !q ||
      a.result?.commonName?.toLowerCase().includes(q) ||
      a.result?.scientificName?.toLowerCase().includes(q)
    );
  });

  async function remove(id: string) {
    if (!confirm("Delete this identification?")) return;
    setBusy(id);
    const supabase = createClient();
    await supabase?.from("analyses").delete().eq("id", id);
    setItems((prev) => prev.filter((a) => a.id !== id));
    setBusy(null);
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 grid place-items-center rounded-3xl border border-foreground/8 bg-card/50 p-16 text-center">
        <History className="h-10 w-10 text-foreground/30" />
        <p className="mt-4 font-medium">No identifications yet</p>
        <p className="mt-1 text-sm text-foreground/50">Your scanned spiders will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your scans…"
          className="h-11 w-full rounded-full border border-foreground/10 bg-foreground/5 pl-11 pr-4 text-sm focus:border-gold/50 focus:outline-none"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <div key={a.id} className="group overflow-hidden rounded-3xl border border-foreground/8 bg-card/50">
            <button onClick={() => setActive(a)} className="block w-full text-left">
              <div className="relative h-40">
                {a.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt={a.result?.commonName} className="h-full w-full object-cover" />
                ) : (
                  <SpeciesArt accent={a.result?.venomLevel === "dangerous" ? "crimson" : "gold"} className="h-full w-full" />
                )}
                {a.result?.venomLevel && (
                  <div className="absolute left-3 top-3">
                    <VenomBadge level={a.result.venomLevel} />
                  </div>
                )}
              </div>
            </button>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{a.result?.commonName}</p>
                  <p className="truncate text-xs italic text-foreground/50">{a.result?.scientificName}</p>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  disabled={busy === a.id}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-foreground/40 hover:bg-red-500/10 hover:text-red-500"
                  title="Delete"
                >
                  {busy === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-foreground/45">
                <Calendar className="h-3 w-3" /> {formatDate(a.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* detail modal */}
      {active && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-auto rounded-3xl border border-foreground/10 bg-card p-6">
            <button onClick={() => setActive(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full glass">
              <X className="h-4 w-4" />
            </button>
            {active.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.image_url} alt="" className="h-52 w-full rounded-2xl object-cover" />
            )}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold">{active.result?.commonName}</h3>
                <p className="text-sm italic text-foreground/55">{active.result?.scientificName}</p>
              </div>
              {active.result?.venomLevel && <VenomBadge level={active.result.venomLevel} />}
            </div>
            {active.result?.summary && <p className="mt-3 text-sm text-foreground/70">{active.result.summary}</p>}
            {active.result?.identification?.length ? (
              <ul className="mt-4 space-y-1.5 text-sm text-foreground/70">
                {active.result.identification.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            ) : null}
            {active.result?.recommendedAction && (
              <p className="mt-4 rounded-xl border border-foreground/8 bg-foreground/[0.03] p-3 text-sm text-foreground/70">
                {active.result.recommendedAction}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
