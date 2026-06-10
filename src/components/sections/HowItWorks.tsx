import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { howItWorks } from "@/content/home";
import { getIcon } from "@/lib/icons";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="How it works"
          title={<>From photo to species in <span className="text-gradient">five steps</span></>}
          subtitle="The same pipeline a field expert runs — detection, feature extraction and matching — compressed into under three seconds."
        />

        <div className="relative mt-16">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-[2.75rem] hidden h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent lg:block" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {howItWorks.map((step, i) => {
              const Icon = getIcon(step.icon);
              return (
                <Reveal key={step.title} delay={i * 0.08}>
                  <div className="group relative flex h-full flex-col rounded-3xl border border-foreground/8 bg-card/50 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/30">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-ink-950 shadow-glow transition-transform duration-500 group-hover:scale-110">
                        <Icon className="h-5.5 w-5.5" />
                      </span>
                      <span className="font-display text-4xl font-extrabold text-foreground/8">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/60">{step.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
