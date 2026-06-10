import { cn } from "@/lib/utils";
import { Reveal } from "@/components/fx/Reveal";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold-soft))]",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-glow animate-dot-pulse" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="max-w-3xl text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "max-w-2xl text-base leading-relaxed text-foreground/65 sm:text-lg",
              align === "center" ? "mx-auto" : ""
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
