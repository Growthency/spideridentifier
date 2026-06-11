"use client";

import { useState } from "react";
import { Copy, Check, Share2, Gift, Users, Star } from "lucide-react";

/** Mushroom-style referral page: hero, how-it-works, stats, code + share. */
export function ReferralClient({ code, count }: { code: string; count: number }) {
  const [copied, setCopied] = useState(false);
  const bonusCredits = count * 20;

  const referralLink = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${code}` : `/signup?ref=${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Spider Identifier",
        text: "Sign up with my referral and get 20 bonus credits to identify spiders with AI!",
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 p-6 text-center">
        <div className="absolute -right-4 -top-4 rotate-12 select-none text-8xl opacity-10">🎁</div>
        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold text-white">Referral Program</h2>
          <p className="text-sm text-white/80">
            Share your link — both you and your friend get <strong className="text-white">20 bonus credits</strong> when
            they sign up!
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-foreground/8 bg-card p-6">
        <h3 className="mb-4 text-center text-sm font-semibold text-foreground/60">HOW IT WORKS</h3>
        <div className="flex items-start gap-0">
          {[
            { icon: "🔗", title: "Share your link", desc: "Copy and send your unique referral link to friends" },
            { icon: "👤", title: "Friend signs up", desc: "They create a free account using your link" },
            { icon: "💎", title: "Both get 20 credits", desc: "You and your friend each receive 20 bonus credits" },
          ].map((item, i) => (
            <div key={i} className="relative flex flex-1 flex-col items-center text-center">
              {i < 2 && <div className="absolute left-[calc(50%+20px)] right-0 top-5 h-px bg-foreground/10" />}
              <div className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground/10 bg-foreground/5 text-lg">
                {item.icon}
              </div>
              <p className="mb-1 text-xs font-bold text-foreground">{item.title}</p>
              <p className="px-1 text-xs leading-tight text-foreground/45">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-foreground/8 bg-card p-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#8b5cf620", color: "#8b5cf6" }}>
            <Users className="h-5 w-5" />
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: "#8b5cf6" }}>
            {count}
          </p>
          <p className="mt-1 text-xs text-foreground/45">Friends referred</p>
        </div>
        <div className="rounded-2xl border border-foreground/8 bg-card p-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-[rgb(var(--gold-soft))]">
            <Star className="h-5 w-5" />
          </div>
          <p className="font-display text-3xl font-bold text-[rgb(var(--gold-soft))]">+{bonusCredits}</p>
          <p className="mt-1 text-xs text-foreground/45">Bonus credits earned</p>
        </div>
      </div>

      {/* Your code */}
      <div className="rounded-2xl border border-foreground/8 bg-card p-6">
        <p className="mb-3 text-center text-xs font-semibold text-foreground/60">YOUR REFERRAL CODE</p>
        <div
          className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-foreground/5 p-4"
          style={{ border: "2px dashed #8b5cf640" }}
        >
          <span className="font-mono text-2xl font-bold tracking-[0.3em]" style={{ color: "#8b5cf6" }}>
            {code || "—"}
          </span>
        </div>

        <p className="mb-2 text-xs font-semibold text-foreground/60">YOUR REFERRAL LINK</p>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 truncate rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/60">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
            style={{
              background: copied ? "#22c55e20" : "#8b5cf620",
              color: copied ? "#22c55e" : "#8b5cf6",
              border: `1px solid ${copied ? "#22c55e40" : "#8b5cf640"}`,
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <button
          onClick={shareLink}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-violet-800 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Share2 className="h-4 w-4" /> Share with Friends
        </button>
      </div>

      {/* Note */}
      <p className="pb-4 text-center text-xs text-foreground/45">
        Credits are added instantly when your friend signs up. No limit on referrals — keep sharing! 🕷️
      </p>
    </div>
  );
}
