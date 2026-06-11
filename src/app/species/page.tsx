import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { SpeciesExplorer } from "@/components/species/SpeciesExplorer";
import { getSpecies } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Spider Species Library — Identification, Venom Risk & Habitat",
  description:
    "Browse common and medically significant spider species with identification tips, venom-risk ratings, size and habitat — from house spiders to the black widow.",
  path: "/species",
});

export default async function SpeciesPage() {
  const species = await getSpecies();

  return (
    <>
      <PageHero
        eyebrow="Species library"
        title={<>The spider <span className="text-gradient">species library</span></>}
        subtitle="Identification cues, venom-risk ratings and habitat for the spiders you're most likely to meet — filter by how cautious you need to be."
      />
      <section className="relative pb-12">
        <div className="container-px">
          <SpeciesExplorer species={species} />
        </div>
      </section>
    </>
  );
}
