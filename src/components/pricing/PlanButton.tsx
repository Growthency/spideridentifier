"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const PRICE_ENV: Record<string, string | undefined> = {
  Starter: process.env.NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID,
  Explorer: process.env.NEXT_PUBLIC_PADDLE_EXPLORER_PRICE_ID,
  Pro: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
};

export function PlanButton({
  tier,
  highlighted,
  label,
}: {
  tier: string;
  highlighted?: boolean;
  label: string;
}) {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const priceId = PRICE_ENV[tier];
  const configured = Boolean(token && priceId);
  const [paddle, setPaddle] = useState<Paddle>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured || !token) return;
    initializePaddle({
      token,
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production") || "production",
    }).then((p) => p && setPaddle(p));
  }, [configured, token]);

  const cls = cn(
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5",
    highlighted ? "bg-brand-gradient text-ink-950" : "border border-gold/40 text-foreground hover:bg-gold/10"
  );

  // Paddle not configured → send to free signup
  if (!configured) {
    return (
      <Link href="/signup" className={cls}>
        {label}
      </Link>
    );
  }

  async function checkout() {
    setBusy(true);
    const supabase = createClient();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!data?.user) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    paddle?.Checkout.open({
      items: [{ priceId: priceId!, quantity: 1 }],
      customer: data.user.email ? { email: data.user.email } : undefined,
      customData: { userId: data.user.id, plan: tier.toLowerCase() },
      settings: { successUrl: `${window.location.origin}/dashboard?welcome=1` },
    });
    setBusy(false);
  }

  return (
    <button onClick={checkout} disabled={!paddle || busy} className={cn(cls, "disabled:opacity-60")}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />} {label}
    </button>
  );
}
