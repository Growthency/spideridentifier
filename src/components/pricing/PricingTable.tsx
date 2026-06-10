import Link from "next/link";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/fx/Reveal";
import { pricingTiers } from "@/content/pricing";
import { cn } from "@/lib/utils";

export function PricingTable() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      {pricingTiers.map((tier, i) => (
        <Reveal key={tier.name} delay={i * 0.08}>
          <div
            className={cn(
              "relative flex h-full flex-col rounded-4xl border p-7 transition-all duration-500",
              tier.highlighted
                ? "gradient-border border-transparent bg-card shadow-card lg:-mt-4 lg:mb-4"
                : "border-foreground/10 bg-card/50 hover:border-gold/30"
            )}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-ink-950">
                <Sparkles className="h-3.5 w-3.5" /> Most popular
              </span>
            )}

            <h3 className="font-display text-xl font-bold">{tier.name}</h3>
            <p className="mt-1.5 min-h-[40px] text-sm text-foreground/60">{tier.audience}</p>

            {/* price */}
            <div className="mt-5 flex items-end gap-1.5">
              <span className="font-display text-5xl font-extrabold">${tier.firstMonth}</span>
              <span className="mb-1.5 text-sm text-foreground/50">first month</span>
            </div>
            <p className="mt-1 text-sm text-foreground/45">
              <span className="text-[rgb(var(--gold-soft))]">50% off</span> — then ${tier.regular}/mo
            </p>

            {/* credits */}
            <div className="mt-4 rounded-2xl bg-foreground/[0.04] px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">
                {tier.credits.toLocaleString("en-US")} credits / month
              </p>
              <p className="text-foreground/55">
                {tier.ids} · {tier.perId}
              </p>
            </div>

            <Link
              href={tier.cta.href}
              className={cn(
                "mt-6 inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5",
                tier.highlighted
                  ? "bg-brand-gradient text-ink-950"
                  : "border border-gold/40 text-foreground hover:bg-gold/10"
              )}
            >
              {tier.cta.label}
            </Link>

            <ul className="mt-7 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/75">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gold/15">
                    <Check className="h-3 w-3 text-[rgb(var(--gold-soft))]" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <p className="mt-6 flex items-center gap-1.5 border-t border-foreground/8 pt-4 text-xs text-foreground/50">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" /> 14-day money-back · Cancel anytime
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
