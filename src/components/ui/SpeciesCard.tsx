import Link from "next/link";
import { ArrowUpRight, MapPin, Ruler } from "lucide-react";
import { SpeciesMedia } from "@/components/ui/SpeciesMedia";
import { VenomBadge } from "@/components/ui/VenomBadge";
import type { Species } from "@/lib/types";

export function SpeciesCard({ species }: { species: Species }) {
  return (
    <Link
      href={`/species/${species.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-foreground/8 bg-card/60 transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-card"
    >
      <div className="relative h-44 w-full">
        <SpeciesMedia
          slug={species.slug}
          accent={species.accent}
          alt={`${species.common_name} (${species.scientific_name})`}
          className="h-full w-full transition-transform duration-700 group-hover:scale-105"
          markClassName="transition-transform duration-700 group-hover:rotate-6"
        />
        <div className="absolute left-3 top-3">
          <VenomBadge level={species.venom_level} />
        </div>
        <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full glass opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-gold" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-tight transition-colors group-hover:text-gold">
          {species.common_name}
        </h3>
        <p className="text-sm italic text-foreground/50">{species.scientific_name}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/60">{species.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-foreground/8 pt-4 text-xs text-foreground/50">
          <span className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-gold/70" /> {species.size}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold/70" /> {species.region}
          </span>
        </div>
      </div>
    </Link>
  );
}
