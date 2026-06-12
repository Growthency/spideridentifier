"use client";

import { useState } from "react";
import { Droplet, RotateCcw } from "lucide-react";
import { AdminPageHeader, SaveBar } from "@/components/admin/AdminPageHeader";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";
import { DEFAULT_THEME, type ThemeColors } from "@/lib/siteDefaults";

const FIELDS: { key: keyof ThemeColors; label: string; hint: string }[] = [
  { key: "accentA", label: "Primary accent", hint: "Brand gradient start · links · highlights" },
  { key: "accentB", label: "Gradient middle", hint: "Brand gradient centre stop" },
  { key: "accentC", label: "Gradient end", hint: "Brand gradient end · secondary accents" },
];

export function ThemeEditor({ initial }: { initial: ThemeColors }) {
  const [theme, setTheme] = useState<ThemeColors>(initial);
  const { call, saving, saved, error } = useSiteAdmin();

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        icon={Droplet}
        title="Theme Colors"
        subtitle="Change the brand palette across the whole site — no deploy needed."
      />

      <div className="rounded-xl border border-foreground/8 bg-card p-6">
        <div className="space-y-5">
          {FIELDS.map((f) => (
            <div key={f.key} className="flex flex-wrap items-center gap-4">
              <input
                type="color"
                value={theme[f.key]}
                onChange={(e) => setTheme((t) => ({ ...t, [f.key]: e.target.value }))}
                className="h-12 w-16 cursor-pointer rounded-lg border border-foreground/10 bg-transparent"
                aria-label={f.label}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{f.label}</p>
                <p className="text-xs text-foreground/45">{f.hint}</p>
              </div>
              <input
                value={theme[f.key]}
                onChange={(e) => setTheme((t) => ({ ...t, [f.key]: e.target.value }))}
                className="w-28 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 font-mono text-xs text-foreground focus:border-gold/50 focus:outline-none"
                aria-label={`${f.label} hex value`}
              />
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div className="mt-6 rounded-xl border border-foreground/8 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground/45">Preview</p>
          <div
            className="mb-3 h-12 rounded-full"
            style={{ background: `linear-gradient(120deg, ${theme.accentA} 0%, ${theme.accentB} 45%, ${theme.accentC} 100%)` }}
          />
          <div className="flex gap-2">
            {([theme.accentA, theme.accentB, theme.accentC] as const).map((c, i) => (
              <span key={i} className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: c }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveBar saving={saving} saved={saved} error={error} onSave={() => call({ action: "set_content", key: "theme", value: theme })} />
          <button
            onClick={() => setTheme(DEFAULT_THEME)}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-foreground/10 px-4 py-2.5 text-sm font-medium text-foreground/60 hover:bg-foreground/5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to default
          </button>
        </div>
      </div>
    </div>
  );
}
