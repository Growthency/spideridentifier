"use client";

import { useState } from "react";
import { Home } from "lucide-react";
import { AdminPageHeader, SaveBar } from "@/components/admin/AdminPageHeader";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";

import type { HomepageContent } from "@/lib/siteDefaults";

const FIELDS: { key: keyof HomepageContent; label: string; rows?: number; hint?: string }[] = [
  { key: "eyebrow", label: "Eyebrow badge", hint: "Small pill above the headline" },
  { key: "title_static", label: "Headline (static part)", hint: "Follows the animated “Identify” word" },
  { key: "subtitle", label: "Hero subtitle", rows: 3 },
  { key: "cta_primary", label: "Primary button label" },
  { key: "cta_secondary", label: "Secondary button label" },
];

export function HomepageEditor({ initial }: { initial: HomepageContent }) {
  const [form, setForm] = useState<HomepageContent>(initial);
  const { call, saving, saved, error } = useSiteAdmin();

  const set = (k: keyof HomepageContent, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls =
    "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground focus:border-gold/50 focus:outline-none";

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        icon={Home}
        title="Homepage"
        subtitle="Edit the hero section copy — changes go live on the next refresh."
      />

      <div className="space-y-4 rounded-xl border border-foreground/8 bg-card p-6">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground/55">{f.label}</label>
            {f.rows ? (
              <textarea rows={f.rows} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />
            ) : (
              <input value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />
            )}
            {f.hint && <p className="mt-1 text-xs text-foreground/40">{f.hint}</p>}
          </div>
        ))}
        <SaveBar saving={saving} saved={saved} error={error} onSave={() => call({ action: "set_content", key: "homepage", value: form })} />
      </div>
    </div>
  );
}
