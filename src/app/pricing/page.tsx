import type { Metadata } from "next";
import { ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { PricingTable } from "@/components/pricing/PricingTable";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { pricingFaqs } from "@/content/pricing";

export const metadata: Metadata = {
  title: "Pricing — Simple Plans for Spider Identification",
  description:
    "Start identifying spiders for free, no credit card required. Upgrade to Pro for unlimited identifications, look-alike alerts and identification history.",
  alternates: { canonical: "/pricing" },
};

const perks = [
  { icon: CreditCard, text: "No credit card to start" },
  { icon: ShieldCheck, text: "Cancel anytime, no lock-in" },
  { icon: Sparkles, text: "Free plan forever" },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>Simple pricing for <span className="text-gradient">every spider</span></>}
        subtitle="Start free and upgrade only when you need unlimited identifications and the advanced tools. No credit card required to begin."
      >
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-foreground/60">
          {perks.map((p) => (
            <span key={p.text} className="flex items-center gap-1.5">
              <p.icon className="h-4 w-4 text-gold" /> {p.text}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="relative pb-12">
        <div className="container-px">
          <PricingTable />
        </div>
      </section>

      {/* pricing FAQ */}
      <section className="relative py-20">
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
        </div>
      </section>

      <CtaBand />
    </>
  );
}
