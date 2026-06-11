import type { Metadata } from "next";
import { ScanSearch, Target, HeartHandshake, ShieldCheck, Microscope, Globe2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/fx/Counter";
import { SpiderMark } from "@/components/brand/Logo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Our Mission to Demystify Spiders",
  description:
    "Spider Identifier blends computer vision, machine learning and real arachnology to make accurate, safety-first spider identification accessible to everyone.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: ShieldCheck, title: "Safety first", desc: "Every identification carries a clear venom-risk indicator and honest guidance — never false confidence." },
  { icon: Microscope, title: "Grounded in science", desc: "Predictions are refined with real arachnology: eye patterns, leg stance, habitat and web type." },
  { icon: Globe2, title: "Accessible to all", desc: "No app, no expertise and no cost to try. If you have a photo, you can identify a spider." },
  { icon: Target, title: "Honest about limits", desc: "We show confidence scores and flag uncertainty, because a trustworthy tool admits what it can't see." },
];

const team = [
  { name: "Dr. Elena Marsh", role: "Lead Arachnologist", bio: "Two decades studying spider taxonomy and venom, now translating that expertise into models anyone can use." },
  { name: "Marcus Webb", role: "Field Naturalist", bio: "Wildlife photographer and educator who has documented spiders on five continents." },
  { name: "Priya Nair", role: "Computer Vision Lead", bio: "Builds the detection and classification pipeline that turns a single photo into a confident match." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={<>Making spiders <span className="text-gradient">understood, not feared</span></>}
        subtitle="We built Spider Identifier so that anyone — from the curious to the cautious — can recognise a spider in seconds and know exactly how to respond."
      >
        <Button href="/#identify" size="lg">
          <ScanSearch className="h-5 w-5" /> Try the identifier
        </Button>
      </PageHero>

      {/* mission */}
      <section className="relative py-16">
        <div className="container-px">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <SectionHeading
                  align="left"
                  eyebrow="Our mission"
                  title={<>Bridging <span className="text-gradient">technology and biology</span></>}
                />
                <div className="mt-6 space-y-4 text-foreground/70">
                  <p>
                    Most people meet a spider and feel one of two things: fascination or fear. Both usually come
                    from the same place — not knowing what they&apos;re looking at. A field guide is slow, and a
                    generic photo app rarely understands arachnids.
                  </p>
                  <p>
                    So we built a tool dedicated to one job. Computer vision isolates the spider, machine learning
                    matches its features against thousands of labelled images, and real arachnology sharpens the
                    result — all in under three seconds, on any device.
                  </p>
                  <p>
                    The goal isn&apos;t just a name. It&apos;s the confidence to know whether the spider in your
                    garage is a harmless house spider or one worth keeping your distance from — and the knowledge
                    to appreciate the remarkable animals most of them are.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal direction="left">
              <div className="gradient-border relative aspect-square overflow-hidden rounded-4xl bg-card/60">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.15),transparent_60%)]" />
                <div className="absolute inset-0 grid place-items-center">
                  <SpiderMark className="h-40 w-40 animate-float" />
                </div>
                <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 200 200" aria-hidden="true">
                  {[40, 70, 100].map((r) => (
                    <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#10b981" strokeWidth="0.5" />
                  ))}
                </svg>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="relative py-12">
        <div className="container-px">
          <div className="grid grid-cols-2 gap-4 rounded-4xl glass-card p-8 md:grid-cols-4">
            {siteConfig.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-extrabold text-gradient sm:text-4xl">
                  <Counter value={s.value} />
                </div>
                <div className="mt-1 text-xs text-foreground/55 sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* values */}
      <section className="relative py-16">
        <div className="container-px">
          <SectionHeading
            eyebrow="What we stand for"
            title={<>Principles behind <span className="text-gradient">every result</span></>}
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 4) * 0.07}>
                <div className="h-full rounded-3xl border border-foreground/8 bg-card/50 p-6">
                  <span className="inline-grid h-12 w-12 place-items-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                    <v.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* team */}
      <section className="relative py-16">
        <div className="container-px">
          <SectionHeading
            eyebrow="The team"
            title={<>Arachnologists meet <span className="text-gradient">engineers</span></>}
            subtitle="A small team obsessed with getting spider identification right — scientifically and responsibly."
          />
          <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-3">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-3xl border border-foreground/8 bg-card/50 p-6 text-center">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-gradient text-lg font-bold text-ink-950">
                    {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold">{m.name}</h3>
                  <p className="text-sm text-[rgb(var(--gold-soft))]">{m.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{m.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="container-px text-center">
          <HeartHandshake className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mx-auto mt-4 max-w-2xl text-balance font-display text-3xl font-bold sm:text-4xl">
            Have a question or a spider to identify?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/#identify" size="lg">
              <ScanSearch className="h-5 w-5" /> Identify a spider
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Get in touch
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
