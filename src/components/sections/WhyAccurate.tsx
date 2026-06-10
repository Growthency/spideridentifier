import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { whyAccurate } from "@/content/home";
import { getIcon } from "@/lib/icons";

export function WhyAccurate() {
  return (
    <section className="relative py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Why it's more accurate"
          title={<>Not a guess — a <span className="text-gradient">biology-tuned</span> match</>}
          subtitle="Raw image matching only gets you so far. Real arachnology refines every prediction so you can act with confidence."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyAccurate.map((f, i) => {
            const Icon = getIcon(f.icon);
            return (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-foreground/8 bg-card/50 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-card">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="inline-grid h-12 w-12 place-items-center rounded-2xl border border-gold/20 bg-gold/10 text-gold transition-colors duration-500 group-hover:bg-brand-gradient group-hover:text-ink-950">
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
