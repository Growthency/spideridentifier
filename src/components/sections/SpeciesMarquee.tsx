import { Marquee } from "@/components/fx/Marquee";
import { speciesLibrary } from "@/content/species";
import { cn } from "@/lib/utils";

const dot: Record<string, string> = {
  harmless: "bg-emerald-400",
  mild: "bg-gold",
  caution: "bg-orange-400",
  dangerous: "bg-crimson",
};

function Pill({ name, level }: { name: string; level: string }) {
  return (
    <span className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-foreground/8 bg-foreground/[0.03] px-5 py-2.5 text-sm font-medium text-foreground/70">
      <span className={cn("h-2 w-2 rounded-full animate-dot-pulse", dot[level])} />
      {name}
    </span>
  );
}

export function SpeciesMarquee() {
  const list = speciesLibrary;
  return (
    <section className="relative border-y border-foreground/8 py-8" aria-label="Species the tool can identify">
      <p className="container-px mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
        Trained across common &amp; medically significant species worldwide
      </p>
      <div className="flex flex-col gap-3">
        <Marquee>
          {list.map((s) => (
            <Pill key={s.slug} name={s.common_name} level={s.venom_level} />
          ))}
        </Marquee>
        <Marquee reverse>
          {[...list].reverse().map((s) => (
            <Pill key={s.slug} name={s.scientific_name} level={s.venom_level} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
