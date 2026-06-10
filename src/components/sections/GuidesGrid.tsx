import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { guideCategories } from "@/content/home";

export function GuidesGrid() {
  return (
    <section className="relative py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Identification guides"
          title={<>Browse by <span className="text-gradient">what you need to know</span></>}
          subtitle="Deep-dive guides covering the spiders people search for most — what they look like, where they live and whether they bite."
        />

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {guideCategories.map((g, i) => (
            <Reveal key={g.title} delay={(i % 4) * 0.05}>
              <Link
                href={g.href}
                className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-foreground/8 bg-card/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-gold/[0.06]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-sm font-medium leading-tight text-foreground/85 group-hover:text-foreground">
                    {g.title}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/30 transition-colors group-hover:text-gold" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
