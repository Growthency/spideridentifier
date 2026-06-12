"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { AdminPageHeader, SaveBar } from "@/components/admin/AdminPageHeader";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";

import type { FooterContent } from "@/lib/siteDefaults";

const FIELDS: { key: keyof FooterContent; label: string; rows?: number }[] = [
  { key: "description", label: "Brand description", rows: 3 },
  { key: "contact_email", label: "Contact email" },
  { key: "newsletter_heading", label: "Newsletter heading" },
  { key: "newsletter_sub", label: "Newsletter subtitle", rows: 2 },
  { key: "accept_label", label: "Payments label (“We accept”)" },
  { key: "secured_line", label: "Security line" },
  { key: "copyright", label: "Copyright text (year is added automatically)" },
  { key: "safety_note", label: "Safety disclaimer", rows: 4 },
];

export function FooterSettingsEditor({ initial }: { initial: FooterContent }) {
  const [form, setForm] = useState<FooterContent>(initial);
  const { call, saving, saved, error } = useSiteAdmin();

  const set = (k: keyof FooterContent, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls =
    "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground focus:border-gold/50 focus:outline-none";

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        icon={Palette}
        title="Footer Content"
        subtitle="Everything in the public footer — edits go live without a deploy."
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
          </div>
        ))}
        <SaveBar saving={saving} saved={saved} error={error} onSave={() => call({ action: "set_content", key: "footer", value: form })} />
      </div>
    </div>
  );
}
