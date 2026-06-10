import type { Metadata } from "next";
import { ScanSearch, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { VisualSignals } from "@/components/sections/VisualSignals";
import { AnatomySpider } from "@/components/identify/AnatomySpider";
import { Reveal } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { anatomyParts, webTypes } from "@/content/anatomy";
import { round } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Spider Anatomy Explained — Body, Legs, Eyes & Webs",
  description:
    "A clear guide to spider anatomy: the two body sections, eight legs, eye arrangements and web types — the features that make spider identification possible.",
  alternates: { canonical: "/anatomy" },
};

export default function AnatomyPage() {
  return (
    <>
      <PageHero
        eyebrow="Spider anatomy"
        title={<>The anatomy that <span className="text-gradient">gives a spider away</span></>}
        subtitle="Two body parts, eight legs, up to eight eyes and silk on demand. Learn the blueprint and identification stops being guesswork."
      />

      {/* intro + big illustration */}
      <section className="relative pb-8">
        <div className="container-px">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="order-2 grid gap-4 lg:order-1">
              {anatomyParts.map((part, i) => (
                <Reveal key={part.key} delay={(i % 4) * 0.06}>
                  <div className="rounded-3xl border border-foreground/8 bg-card/50 p-6">
                    <h3 className="font-display text-lg font-bold text-gold">{part.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/65">{part.summary}</p>
                    <ul className="mt-3 space-y-2">
                      {part.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-foreground/70">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="order-1 lg:order-2 lg:sticky lg:top-28">
              <div className="gradient-border relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-4xl bg-card/60 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,165,36,0.12),transparent_60%)]" />
                <AnatomySpider active="body" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* interactive signals */}
      <VisualSignals />

      {/* web types */}
      <section id="webs" className="relative py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Web types"
            title={<>Read the <span className="text-gradient">web</span>, narrow the spider</>}
            subtitle="Not every spider builds a web — but the ones that do leave a signature you can recognise at a glance."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {webTypes.map((web, i) => (
              <Reveal key={web.name} delay={(i % 4) * 0.07}>
                <div className="group h-full rounded-3xl border border-foreground/8 bg-card/50 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/30">
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-gold/20 bg-gold/10">
                    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
                      {[6, 12, 18].map((r) => (
                        <circle key={r} cx="24" cy="24" r={r} stroke="#F5A524" strokeWidth="1" opacity="0.7" />
                      ))}
                      {Array.from({ length: 8 }).map((_, k) => {
                        const a = (k / 8) * Math.PI * 2;
                        return (
                          <line
                            key={k}
                            x1="24"
                            y1="24"
                            x2={round(24 + Math.cos(a) * 20)}
                            y2={round(24 + Math.sin(a) * 20)}
                            stroke="#F5A524"
                            strokeWidth="0.8"
                            opacity="0.5"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold">{web.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{web.desc}</p>
                  <p className="mt-3 text-xs font-medium text-[rgb(var(--gold-soft))]">{web.spiders}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button href="/#identify" size="lg">
              <ScanSearch className="h-5 w-5" /> Put it to the test — identify a spider
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
