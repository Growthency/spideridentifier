"use client";

import { useState } from "react";
import { Paintbrush } from "lucide-react";
import { AdminPageHeader, SaveBar } from "@/components/admin/AdminPageHeader";
import { useSiteAdmin } from "@/components/admin/useSiteAdmin";

export function CustomCssEditor({ initial }: { initial: string }) {
  const [css, setCss] = useState(initial);
  const { call, saving, saved, error } = useSiteAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        icon={Paintbrush}
        title="Custom CSS"
        subtitle="Injected site-wide after the theme styles — tweak anything without a deploy."
      />

      <div className="rounded-xl border border-foreground/8 bg-card p-5">
        <textarea
          value={css}
          onChange={(e) => setCss(e.target.value)}
          spellCheck={false}
          rows={22}
          placeholder={"/* Example */\n.navbar { backdrop-filter: blur(20px); }"}
          className="w-full rounded-xl border border-foreground/10 bg-foreground/5 p-4 font-mono text-sm leading-relaxed text-foreground focus:border-gold/50 focus:outline-none"
        />
        <p className="mt-2 text-xs text-foreground/45">
          Applied on every public page inside a <code>&lt;style&gt;</code> tag. Leave empty to disable.
        </p>
        <SaveBar saving={saving} saved={saved} error={error} onSave={() => call({ action: "set_content", key: "custom_css", value: css })} />
      </div>
    </div>
  );
}
