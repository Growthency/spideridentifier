import { AlertTriangle, Eye, MapPin, Microscope } from "lucide-react";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";

const limits = [
  {
    icon: Eye,
    title: "Closest match, not a verdict",
    desc: "The AI returns the most likely species with a confidence score — treat it as a strong hypothesis, not a guaranteed identification.",
  },
  {
    icon: AlertTriangle,
    title: "Environmental noise misleads",
    desc: "Busy backgrounds, harsh shadows and reflections can confuse detection. A clean, well-lit photo dramatically improves the result.",
  },
  {
    icon: Microscope,
    title: "Some species need a microscope",
    desc: "A handful of look-alikes can only be separated by microscopic traits no camera can capture. We flag uncertainty rather than fake confidence.",
  },
  {
    icon: MapPin,
    title: "Location is optional",
    desc: "Regional data sharpens accuracy, but it is only used when you choose to share it — so a global guess is always possible.",
  },
];

export function Limitations() {
  return (
    <section className="relative py-24">
      <div className="container-px">
        <div className="overflow-hidden rounded-4xl border border-foreground/10 bg-card/40 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Honest about limits</Eyebrow>
              <h2 className="mt-5 text-balance font-display text-3xl font-bold leading-tight sm:text-4xl">
                What AI <span className="text-gradient">can&apos;t</span> tell you
              </h2>
              <p className="mt-4 max-w-md text-foreground/65">
                A photo captures shape, colour and texture — but not everything. Knowing the limits is what makes
                the tool trustworthy, especially when safety is on the line.
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-crimson/25 bg-crimson/5 p-4 text-sm text-foreground/70">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[rgb(var(--crimson-soft))]" />
                <p>
                  For a suspected venomous bite, never rely on a photo. Seek professional or medical advice
                  immediately.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {limits.map((l, i) => (
                <Reveal key={l.title} delay={(i % 2) * 0.08}>
                  <div className="h-full rounded-2xl border border-foreground/8 bg-card/40 p-5">
                    <l.icon className="h-6 w-6 text-gold" />
                    <h3 className="mt-3 font-display text-base font-bold">{l.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{l.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
