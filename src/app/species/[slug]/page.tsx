import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ScanSearch, Ruler, MapPin, Home, Bug, Sparkles, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SpeciesMedia } from "@/components/ui/SpeciesMedia";
import { photoCredits } from "@/content/photoCredits";
import { VenomBadge } from "@/components/ui/VenomBadge";
import { SpeciesCard } from "@/components/ui/SpeciesCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/fx/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSpecies, getSpeciesBySlugData } from "@/lib/data";
import { speciesLibrary } from "@/content/species";
import { siteConfig } from "@/lib/site";

export async function generateStaticParams() {
  return speciesLibrary.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const species = await getSpeciesBySlugData(slug);
  if (!species) return { title: "Species not found" };
  return {
    title: `${species.common_name} (${species.scientific_name}) — Identification & Venom Risk`,
    description: species.summary,
    alternates: { canonical: `/species/${species.slug}` },
  };
}

export default async function SpeciesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const species = await getSpeciesBySlugData(slug);
  if (!species) notFound();

  const all = await getSpecies();
  const related = all.filter((s) => s.slug !== species.slug).slice(0, 4);

  const facts = [
    { icon: Bug, label: "Family", value: species.family },
    { icon: Ruler, label: "Size", value: species.size },
    { icon: MapPin, label: "Region", value: species.region },
    { icon: Home, label: "Habitat", value: species.habitat },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${species.common_name} identification`,
          description: species.summary,
          about: species.scientific_name,
          publisher: { "@type": "Organization", name: siteConfig.name },
        }}
      />

      <PageHero
        eyebrow={species.family}
        title={
          <>
            The <span className="text-gradient">{species.common_name}</span>
          </>
        }
        subtitle={species.scientific_name}
      >
        <div className="flex flex-col items-center gap-4">
          <VenomBadge level={species.venom_level} className="px-4 py-1.5 text-sm" />
        </div>
      </PageHero>

      <section className="relative pb-12">
        <div className="container-px">
          <Link
            href="/species"
            className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/55 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> All species
          </Link>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* art + facts */}
            <div className="lg:col-span-2">
              <div className="gradient-border overflow-hidden rounded-4xl p-1.5">
                <SpeciesMedia
                  slug={species.slug}
                  accent={species.accent}
                  alt={`${species.common_name} (${species.scientific_name})`}
                  className="aspect-square w-full rounded-[1.85rem]"
                  markClassName="h-28 w-28"
                />
              </div>
              {photoCredits[species.slug] && (
                <p className="mt-2 text-center text-[11px] text-foreground/40">
                  Photo:{" "}
                  <a
                    href={photoCredits[species.slug].source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold"
                  >
                    {photoCredits[species.slug].artist}
                  </a>{" "}
                  · {photoCredits[species.slug].license} · Wikimedia Commons
                </p>
              )}
              <div className="mt-5 grid gap-3">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-start gap-3 rounded-2xl border border-foreground/8 bg-card/50 p-4">
                    <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-foreground/45">{f.label}</p>
                      <p className="text-sm text-foreground/85">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* content */}
            <div className="lg:col-span-3">
              <h2 className="font-display text-2xl font-bold">Overview</h2>
              <p className="mt-3 text-lg leading-relaxed text-foreground/70">{species.summary}</p>

              <h2 className="mt-10 font-display text-2xl font-bold">How to identify it</h2>
              <ul className="mt-4 space-y-3">
                {species.identification.map((point) => (
                  <li key={point} className="flex items-start gap-3 rounded-2xl border border-foreground/8 bg-card/40 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <span className="text-foreground/80">{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-start gap-3 rounded-3xl border border-gold/20 bg-gold/[0.06] p-6">
                <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
                <div>
                  <p className="font-display font-bold">Standout fact</p>
                  <p className="mt-1 text-foreground/75">{species.fact}</p>
                </div>
              </div>

              <div className="mt-8">
                <Button href="/#identify" size="lg">
                  <ScanSearch className="h-5 w-5" />
                  Identify your spider
                </Button>
              </div>
            </div>
          </div>

          {/* related */}
          <div className="mt-20">
            <h2 className="mb-8 font-display text-2xl font-bold">Related species</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((s, i) => (
                <Reveal key={s.slug} delay={(i % 4) * 0.07}>
                  <SpeciesCard species={s} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
