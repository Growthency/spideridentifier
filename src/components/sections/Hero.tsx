import { ScanSearch, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Typewriter } from "@/components/fx/Typewriter";
import { Counter } from "@/components/fx/Counter";
import { Reveal } from "@/components/fx/Reveal";
import { ScrollCue } from "@/components/fx/ScrollCue";
import { SpiderMark } from "@/components/brand/Logo";
import { heroRotatingWords, trustBadges } from "@/content/home";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-12 pt-32 sm:pt-36 lg:pt-40">
      {/* floating decorative marks */}
      <SpiderMark className="pointer-events-none absolute right-[8%] top-28 hidden h-10 w-10 animate-float opacity-30 lg:block" />
      <SpiderMark className="pointer-events-none absolute left-[6%] top-[55%] hidden h-7 w-7 animate-float-slow opacity-20 lg:block" />

      <div className="container-px">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-soft))]">
              <Sparkles className="h-3.5 w-3.5" /> AI-Powered Arachnology
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="text-gradient-animate">Identify any spider</span>
              <br />
              <Typewriter words={heroRotatingWords} />
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/65">
              Upload a single photo and discover the species in seconds — complete with venom-risk indicators,
              look-alike alerts, habitat data and expert guides. Free to try, no app required.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/#identify" size="lg">
                <ScanSearch className="h-5 w-5" />
                Identify a Spider
              </Button>
              <Button href="/species" variant="secondary" size="lg">
                Browse species
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-foreground/50">
              {trustBadges.map((b, i) => (
                <li key={b} className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-gold to-crimson animate-dot-pulse"
                    style={{ animationDelay: `${i * 0.25}s` }}
                  />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* stats */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 rounded-4xl glass-card p-6 sm:p-8 md:grid-cols-4">
            {siteConfig.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-extrabold text-gradient sm:text-4xl">
                  <Counter value={s.value} />
                </div>
                <div className="mt-1 text-xs text-foreground/55 sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-foreground/35">
            *Top-match accuracy on clear, well-lit images of common species.
          </p>
        </Reveal>

        <ScrollCue className="mt-7" />
      </div>
    </section>
  );
}
