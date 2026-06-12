"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

/** Purges the ISR/data cache so fresh GA4 + content shows immediately. */
export function ClearCacheButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function clear() {
    setBusy(true);
    try {
      await fetch("/api/admin/revalidate", { method: "POST" });
      router.refresh();
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={clear}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/5 disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-[rgb(var(--gold-soft))]" />}
      {done ? "Cache cleared!" : "Clear Cache"}
    </button>
  );
}
