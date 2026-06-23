import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { IdentifySection } from "@/components/sections/IdentifySection";
import { HomeArticle } from "@/components/sections/HomeArticle";
import { JsonLd, homepageGraphSchema } from "@/components/seo/JsonLd";

// Static with hourly refresh.
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

      {/* Hero + the scan tool stay; everything else is the new SEO content. */}
      <Hero />
      <IdentifySection />
      <HomeArticle />
    </>
  );
}
