"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader, SaveBar } from "@/components/admin/AdminPageHeader";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";
import type { ExternalLinkRule } from "@/lib/siteContent";

export function ExternalLinksEditor({ initial, configured }: { initial: ExternalLinkRule[]; configured: boolean }) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [nofollow, setNofollow] = useState(true);
  const [sponsored, setSponsored] = useState(false);
  const { call, saving, saved, error } = useSiteAdmin();

  async function add() {
    const ok = await call({ action: "save_link_rule", rule: { domain, nofollow, sponsored } });
    if (ok) {
      setDomain("");
      setNofollow(true);
      setSponsored(false);
      router.refresh();
    }
  }

  async function remove(id: string) {
    const ok = await call({ action: "delete_link_rule", id });
    if (ok) router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        icon={ExternalLink}
        title="External Links"
        subtitle="Per-domain rel rules — outbound links in articles get nofollow/sponsored automatically."
      />

      {!configured && (
        <p className="mb-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-foreground/70">
          Configure Supabase and run <code className="text-[rgb(var(--gold-soft))]">supabase/admin-schema.sql</code> to manage link rules.
        </p>
      )}

      {/* Add rule */}
      <div className="mb-6 rounded-xl border border-foreground/8 bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input
            placeholder="domain.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="min-w-[200px] flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground focus:border-gold/50 focus:outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={nofollow} onChange={(e) => setNofollow(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
            nofollow
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={sponsored} onChange={(e) => setSponsored(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
            sponsored
          </label>
          <button
            onClick={add}
            disabled={saving || !domain.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {saved ? "Added!" : "Add Rule"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {/* Rules list */}
      <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
        {initial.length === 0 ? (
          <p className="p-10 text-center text-sm text-foreground/45">
            No rules yet. All outbound article links keep their default <code>rel=&quot;noopener&quot;</code>.
          </p>
        ) : (
          initial.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-3 px-5 py-4 ${i < initial.length - 1 ? "border-b border-foreground/8" : ""}`}>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{r.domain}</p>
              {r.nofollow && <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-500">nofollow</span>}
              {r.sponsored && <span className="rounded-full bg-violet-500/15 px-2 py-1 text-xs font-semibold text-violet-500">sponsored</span>}
              <button onClick={() => remove(r.id)} className="rounded-lg p-2 hover:opacity-70" style={{ background: "#ef444418", color: "#ef4444" }} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
