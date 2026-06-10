import creditsData from "../../public/images/species/CREDITS.json";

export interface PhotoCredit {
  artist: string;
  license: string;
  source: string;
}

/** slug → attribution for the license-safe Wikimedia Commons species photos. */
export const photoCredits: Record<string, PhotoCredit> = Object.fromEntries(
  (creditsData as { slug: string; artist: string; license: string; source: string }[]).map((c) => [
    c.slug,
    { artist: c.artist, license: c.license, source: c.source },
  ])
);

export const hasSpeciesPhoto = (slug: string) => slug in photoCredits;
