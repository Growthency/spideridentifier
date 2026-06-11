"use client";

import { useState } from "react";
import { Copy, Check, Gift } from "lucide-react";

export function ReferralBox({ code, link, count }: { code: string; link: string; count: number }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-foreground/8 bg-card/50 p-6">
          <Gift className="h-6 w-6 text-gold" />
          <p className="mt-3 font-display text-3xl font-extrabold">{count}</p>
          <p className="text-sm text-foreground/55">Friends referred</p>
        </div>
        <div className="rounded-3xl border border-gold/20 bg-gold/[0.06] p-6">
          <p className="font-display text-3xl font-extrabold text-gradient">+{count * 20}</p>
          <p className="text-sm text-foreground/55">Bonus credits earned</p>
          <p className="mt-2 text-xs text-foreground/45">You both get 20 credits per signup.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-foreground/8 bg-card/50 p-6">
        <h2 className="font-display text-lg font-bold">Your referral code</h2>
        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 font-mono text-lg font-bold tracking-widest">
            {code || "—"}
          </code>
          <button
            onClick={() => copy(code, "code")}
            className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-ink-950"
          >
            {copied === "code" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>

        <p className="mt-5 mb-2 text-sm font-medium text-foreground/70">Share your invite link</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground/70"
          />
          <button
            onClick={() => copy(link, "link")}
            className="grid h-12 w-12 place-items-center rounded-xl border border-gold/40 hover:bg-gold/10"
          >
            {copied === "link" ? <Check className="h-5 w-5 text-gold" /> : <Copy className="h-5 w-5 text-gold" />}
          </button>
        </div>
      </div>
    </div>
  );
}
