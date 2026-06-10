import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { SpeciesCard } from "@/components/ui/SpeciesCard";
import { speciesLibrary } from "@/content/species";

export function SpeciesShowcase() {
  const featured = speciesLibrary.slice(0, 8);
  return (
    <section className="relative py-24">
      <div className="container-px">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            align="left"
            eyebrow="Species library"
            title={<>Know your eight-legged <span className="text-gradient">neighbours</span></>}
            subtitle="From harmless house spiders to the species worth respecting — each profile carries identifiers, habitat and a clear venom-risk rating."
            className="md:max-w-2xl"
          />
          <Button href="/species" variant="outline" className="shrink-0">
            View all species <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 4) * 0.07}>
              <SpeciesCard species={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
