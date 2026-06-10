import { Eyebrow } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { cn } from "@/lib/utils";

/** Consistent header band for inner pages. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden pb-12 pt-32 sm:pt-40", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="container-px">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          {eyebrow && (
            <Reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </Reveal>
          {subtitle && (
            <Reveal delay={0.1}>
              <p className="max-w-2xl text-lg leading-relaxed text-foreground/65">{subtitle}</p>
            </Reveal>
          )}
          {children && <Reveal delay={0.15}>{children}</Reveal>}
        </div>
      </div>
    </section>
  );
}
