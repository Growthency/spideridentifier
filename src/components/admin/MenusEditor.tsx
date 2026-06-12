"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListOrdered, Plus, Trash2, Pencil, X } from "lucide-react";
import { AdminPageHeader, SaveBar } from "@/components/admin/AdminPageHeader";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";
import type { MenuItem } from "@/lib/siteContent";

const MENUS: { key: MenuItem["menu"]; label: string; note: string }[] = [
  { key: "header", label: "Header", note: "Main navigation bar" },
  { key: "footer_explore", label: "Footer · Explore", note: "First footer column" },
  { key: "footer_company", label: "Footer · Company", note: "Second footer column" },
  { key: "footer_bottom", label: "Footer · Bottom", note: "Legal links row" },
];

type Draft = Partial<MenuItem>;

export function MenusEditor({ initial, configured }: { initial: MenuItem[]; configured: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState<MenuItem["menu"]>("header");
  const [editing, setEditing] = useState<Draft | null>(null);
  const { call, saving, saved, error } = useSiteAdmin();

  const items = initial.filter((m) => m.menu === active);

  async function save() {
    if (!editing) return;
    const ok = await call({ action: "save_menu_item", item: { ...editing, menu: editing.menu ?? active } });
    if (ok) {
      setEditing(null);
      router.refresh();
    }
  }

  async function remove(id: string) {
    const ok = await call({ action: "delete_menu_item", id });
    if (ok) router.refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground focus:border-gold/50 focus:outline-none";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between gap-3">
        <AdminPageHeader
          icon={ListOrdered}
          title="Menus"
          subtitle="Header and footer navigation — empty menus fall back to the built-in links."
        />
        <button
          onClick={() => setEditing({ menu: active, target: "_self", enabled: true, sort_order: (items[items.length - 1]?.sort_order ?? 0) + 10 })}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-ink-950"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {!configured && (
        <p className="mb-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-foreground/70">
          Configure Supabase and run <code className="text-[rgb(var(--gold-soft))]">supabase/admin-schema.sql</code> to manage menus.
        </p>
      )}

      {/* Menu tabs */}
      <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-foreground/10 bg-card p-1 text-sm">
        {MENUS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActive(m.key)}
            title={m.note}
            className={`rounded-lg px-3.5 py-2 font-medium transition-colors ${
              active === m.key ? "bg-emerald-500/15 text-emerald-500" : "text-foreground/55 hover:bg-foreground/5"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      {editing && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editing.id ? "Edit item" : "New item"}</h2>
            <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-foreground/45 hover:bg-foreground/5" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Label" value={editing.label ?? ""} onChange={(e) => setEditing((d) => ({ ...d, label: e.target.value }))} className={inputCls} />
            <input placeholder="URL (/blog or https://…)" value={editing.url ?? ""} onChange={(e) => setEditing((d) => ({ ...d, url: e.target.value }))} className={inputCls} />
            <select value={editing.target ?? "_self"} onChange={(e) => setEditing((d) => ({ ...d, target: e.target.value as "_self" | "_blank" }))} className={inputCls}>
              <option value="_self">Same tab</option>
              <option value="_blank">New tab</option>
            </select>
            <input
              type="number"
              placeholder="Sort order"
              value={editing.sort_order ?? 0}
              onChange={(e) => setEditing((d) => ({ ...d, sort_order: Number(e.target.value) }))}
              className={inputCls}
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-foreground/70">
            <input
              type="checkbox"
              checked={editing.enabled !== false}
              onChange={(e) => setEditing((d) => ({ ...d, enabled: e.target.checked }))}
              className="h-4 w-4 accent-emerald-500"
            />
            Enabled
          </label>
          <SaveBar saving={saving} saved={saved} error={error} onSave={save} label={editing.id ? "Update Item" : "Add Item"} />
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
        {items.length === 0 ? (
          <p className="p-10 text-center text-sm text-foreground/45">
            No custom items — the site shows its built-in {MENUS.find((m) => m.key === active)?.label.toLowerCase()} links.
          </p>
        ) : (
          items.map((m, i) => (
            <div key={m.id} className={`flex items-center gap-3 px-5 py-4 ${i < items.length - 1 ? "border-b border-foreground/8" : ""}`}>
              <span className="w-8 shrink-0 text-xs font-bold text-foreground/35">{m.sort_order}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{m.label}</p>
                <p className="truncate text-xs text-foreground/45">
                  {m.url} {m.target === "_blank" && "· new tab"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${m.enabled ? "bg-emerald-500/15 text-emerald-500" : "bg-foreground/10 text-foreground/45"}`}
              >
                {m.enabled ? "On" : "Off"}
              </span>
              <button onClick={() => setEditing(m)} className="rounded-lg bg-foreground/5 p-2 text-foreground/60 hover:opacity-70" title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(m.id)} className="rounded-lg p-2 hover:opacity-70" style={{ background: "#ef444418", color: "#ef4444" }} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
