"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Premium-article gate: paid plans read everything, everyone else sees the
 * opening of the article under a fade with an upgrade prompt.
 */
export function PremiumGate({ children }: { children: React.ReactNode }) {
  // null = checking (render locked to avoid a content flash for guests)
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setUnlocked(false);
      return;
    }
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUnlocked(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle();
      setUnlocked(Boolean(data?.plan && data.plan !== "free"));
    })();
  }, []);

  if (unlocked) return <>{children}</>;

  return (
    <div>
      <div className="relative max-h-[420px] overflow-hidden" aria-hidden="true">
        {children}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/90 to-transparent" />
      </div>
      <div className="relative -mt-10 rounded-3xl border border-gold/25 bg-card/80 p-8 text-center shadow-card">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gold/10">
          <Lock className="h-6 w-6 text-[rgb(var(--gold-soft))]" />
        </span>
        <h3 className="mb-2 font-display text-xl font-bold text-foreground">This is a premium guide</h3>
        <p className="mx-auto mb-5 max-w-sm text-sm text-foreground/60">
          Upgrade to any paid plan to read the full article — plus more monthly identification credits.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/pricing" className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-6 text-sm font-semibold text-ink-950">
            <Crown className="h-4 w-4" /> View Plans
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-full border border-foreground/12 px-6 text-sm font-medium text-foreground/75 hover:bg-foreground/5"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
