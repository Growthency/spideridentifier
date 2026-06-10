import type { Metadata } from "next";
import Link from "next/link";
import { Check, ScanSearch, Lock } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { PricingTable } from "@/components/pricing/PricingTable";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import {
  pricingHeadline,
  pricingSub,
  pricingPromo,
  pricingHowItWorks,
  pricingFaqs,
  pricingTrust,
  freeTier,
} from "@/content/pricing";

export const metadata: Metadata = {
  title: "Pricing — 7 Days Free, Then 50% Off Your First Month",
  description:
    "Try every spider-identification feature free for 7 days, then save 50% on your first month. Monthly plans, fresh credits, 14-day money-back guarantee, cancel anytime.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Pricing" title={pricingHeadline} subtitle={pricingSub}>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {pricingPromo.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/5 px-3.5 py-1.5 text-xs font-semibold text-[rgb(var(--gold-soft))]"
            >
              <Check className="h-3.5 w-3.5" /> {p}
            </span>
          ))}
        </div>
      </PageHero>

      {/* tiers */}
      <section className="relative pb-8">
        <div className="container-px">
          <PricingTable />
        </div>
      </section>

      {/* free tier callout */}
      <section className="relative py-8">
        <div className="container-px">
          <Reveal>
            <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-5 rounded-3xl border border-foreground/10 bg-card/50 p-6 text-center sm:flex-row sm:text-left">
              <div>
                <h3 className="font-display text-lg font-bold">{freeTier.name}</h3>
                <p className="mt-1 text-sm text-foreground/60">{freeTier.blurb}</p>
              </div>
              <Link
                href={freeTier.cta.href}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-gold/40 px-5 text-sm font-semibold text-foreground transition-colors hover:bg-gold/10"
              >
                <ScanSearch className="h-4 w-4 text-gold" /> {freeTier.cta.label}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* how it works */}
      <section className="relative py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="How billing works"
            title={<>Free to start, <span className="text-gradient">fair to stay</span></>}
            subtitle="No surprises — here's exactly what happens from trial to subscription."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pricingHowItWorks.map((s, i) => (
              <Reveal key={s.step} delay={(i % 4) * 0.08}>
                <div className="h-full rounded-3xl border border-foreground/8 bg-card/50 p-6">
                  <span className="font-display text-3xl font-extrabold text-gradient">{s.step}</span>
                  <h3 className="mt-3 font-display text-base font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-12">
        <div className="container-px">
          <SectionHeading
            eyebrow="Billing questions"
            title={<>Pricing, <span className="text-gradient">answered</span></>}
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
            {pricingFaqs.map((f, i) => (
              <Reveal key={f.q} delay={(i % 2) * 0.08}>
                <div className="h-full rounded-3xl border border-foreground/8 bg-card/50 p-6">
                  <h3 className="font-display text-base font-bold">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* trust */}
          <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {pricingTrust.methods.map((m) => (
                <span
                  key={m}
                  className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-xs font-medium text-foreground/65"
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs text-foreground/50">
              <Lock className="h-3.5 w-3.5 text-gold" /> {pricingTrust.note}
            </p>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
