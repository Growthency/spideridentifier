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
import { Faq } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { WaveDivider } from "@/components/fx/WaveDivider";
import { JsonLd, websiteSchema, organizationSchema, faqSchema } from "@/components/seo/JsonLd";

// Static with hourly refresh — latest guides stay current without
// per-request rendering.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={faqSchema} />

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
      <Faq />
      <CtaBand />
    </>
  );
}
