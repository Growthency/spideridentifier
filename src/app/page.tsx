import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { IdentifySection } from "@/components/sections/IdentifySection";
import { SpeciesMarquee } from "@/components/sections/SpeciesMarquee";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhyAccurate } from "@/components/sections/WhyAccurate";
import { VisualSignals } from "@/components/sections/VisualSignals";
import { SpeciesShowcase } from "@/components/sections/SpeciesShowcase";
import { GuidesGrid } from "@/components/sections/GuidesGrid";
import { Comparison } from "@/components/sections/Comparison";
import { LatestGuides } from "@/components/sections/LatestGuides";
import { Limitations } from "@/components/sections/Limitations";
import { HomeArticle } from "@/components/sections/HomeArticle";
import { CtaBand } from "@/components/sections/CtaBand";
import { WaveDivider } from "@/components/fx/WaveDivider";
import { JsonLd, homepageGraphSchema } from "@/components/seo/JsonLd";

// Static with hourly refresh — latest guides stay current without
// per-request rendering.
export const revalidate = 3600;

const HOME_TITLE = "Identify Spider - Free Spider Identification App by Picture";
const HOME_DESCRIPTION =
  "Identify spiders instantly with our free Spider Identifier by Picture tool. Upload a photo to recognize Wolf Spiders, Jumping Spiders, Orb Weavers, House Spiders, Black Widows, Brown Recluses, and more using AI-powered image recognition.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: "Spider Identifier — Articles" }] },
  },
  openGraph: { title: HOME_TITLE, description: HOME_DESCRIPTION },
  twitter: { title: HOME_TITLE, description: HOME_DESCRIPTION },
};

export default function HomePage() {
  return (
    <>
      {/* Homepage-only structured data (@graph). Other routes have their own. */}
      <JsonLd data={homepageGraphSchema} />

      <Hero />
      <IdentifySection />
      <SpeciesMarquee />
      <HowItWorks />
      <WaveDivider />
      <WhyAccurate />
      <VisualSignals />
      <WaveDivider />
      <SpeciesShowcase />
      <GuidesGrid />
      <Comparison />
      <WaveDivider />
      <LatestGuides />
      <Limitations />
      <HomeArticle />
      <CtaBand />
    </>
  );
}
