"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code, Plus, Trash2, Pencil, X } from "lucide-react";
import { AdminPageHeader, SaveBar } from "@/components/admin/AdminPageHeader";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";
import type { SiteScript } from "@/lib/siteContent";

type Draft = Partial<SiteScript>;

const EMPTY: Draft = { label: "", location: "head", code: "", enabled: true, sort_order: 0 };

export function HeaderScriptsEditor({ initial, configured }: { initial: SiteScript[]; configured: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Draft | null>(null);
  const { call, saving, saved, error } = useSiteAdmin();

  async function save() {
    if (!editing) return;
    const ok = await call({ action: "save_script", script: editing });
    if (ok) {
      setEditing(null);
      router.refresh();
    }
  }

  async function remove(id: string) {
    const ok = await call({ action: "delete_script", id });
    if (ok) router.refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground focus:border-gold/50 focus:outline-none";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between gap-3">
        <AdminPageHeader
          icon={Code}
          title="Header Scripts"
          subtitle="Analytics, pixels and verification tags — injected on every public page."
        />
        <button
          onClick={() => setEditing(EMPTY)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-ink-950"
        >
          <Plus className="h-4 w-4" /> Add Script
        </button>
      </div>

      {!configured && (
        <p className="mb-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-foreground/70">
          Configure Supabase and run <code className="text-[rgb(var(--gold-soft))]">supabase/admin-schema.sql</code> to manage scripts.
        </p>
      )}

      {/* Editor */}
      {editing && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editing.id ? "Edit script" : "New script"}</h2>
            <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-foreground/45 hover:bg-foreground/5" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                placeholder="Label (e.g. Google Tag Manager)"
                value={editing.label ?? ""}
                onChange={(e) => setEditing((d) => ({ ...d, label: e.target.value }))}
                className={inputCls + " sm:col-span-2"}
              />
              <select
                value={editing.location ?? "head"}
                onChange={(e) => setEditing((d) => ({ ...d, location: e.target.value as "head" | "body" }))}
                className={inputCls}
              >
                <option value="head">In &lt;head&gt;</option>
                <option value="body">End of &lt;body&gt;</option>
              </select>
            </div>
            <textarea
              rows={7}
              spellCheck={false}
              placeholder={"<script>…</script> or <meta …/>"}
              value={editing.code ?? ""}
              onChange={(e) => setEditing((d) => ({ ...d, code: e.target.value }))}
              className={inputCls + " font-mono text-xs"}
            />
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                checked={editing.enabled !== false}
                onChange={(e) => setEditing((d) => ({ ...d, enabled: e.target.checked }))}
                className="h-4 w-4 accent-emerald-500"
              />
              Enabled
            </label>
          </div>
          <SaveBar saving={saving} saved={saved} error={error} onSave={save} label={editing.id ? "Update Script" : "Add Script"} />
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
        {initial.length === 0 ? (
          <p className="p-10 text-center text-sm text-foreground/45">No scripts yet — add your first tracking tag.</p>
        ) : (
          initial.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 px-5 py-4 ${i < initial.length - 1 ? "border-b border-foreground/8" : ""}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{s.label}</p>
                <p className="truncate font-mono text-xs text-foreground/45">{s.code.slice(0, 80)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-foreground/5 px-2 py-1 text-xs text-foreground/60">{s.location}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${s.enabled ? "bg-emerald-500/15 text-emerald-500" : "bg-foreground/10 text-foreground/45"}`}
              >
                {s.enabled ? "On" : "Off"}
              </span>
              <button onClick={() => setEditing(s)} className="rounded-lg bg-foreground/5 p-2 text-foreground/60 hover:opacity-70" title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(s.id)} className="rounded-lg p-2 hover:opacity-70" style={{ background: "#ef444418", color: "#ef4444" }} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
