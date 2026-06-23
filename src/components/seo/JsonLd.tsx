import { siteConfig } from "@/lib/site";
import { faqs } from "@/content/home";

/** Server-rendered JSON-LD structured data. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.svg`,
  description: siteConfig.description,
  email: siteConfig.email,
  sameAs: siteConfig.social.map((s) => s.href),
};

/** BreadcrumbList for non-homepage pages — items as {name, path}. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.path === "/" ? siteConfig.url : `${siteConfig.url}${it.path}`,
    })),
  };
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/**
 * Full @graph structured data for the HOMEPAGE ONLY (WebPage + WebSite +
 * Organization + SoftwareApplication + HowTo + BreadcrumbList + FAQPage).
 * Other routes render their own per-page schema.
 */
const home = `${siteConfig.url}/`;
export const homepageGraphSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${home}#webpage`,
      url: home,
      name: "Spider Identifier – Spider Identification By Picture",
      description:
        "Identify spiders instantly with our free Spider Identifier by Picture tool. Upload a photo to recognize Wolf Spiders, Jumping Spiders, Orb Weavers, House Spiders, Black Widows, Brown Recluses, and more using AI-powered image recognition.",
      inLanguage: "en",
      isPartOf: { "@id": `${home}#website` },
      about: [
        { "@type": "Thing", name: "Spider Identification" },
        { "@type": "Thing", name: "Spider Species" },
        { "@type": "Thing", name: "Spider Recognition" },
        { "@type": "Thing", name: "Arachnid" },
      ],
      mainEntity: { "@id": `${home}#software` },
    },
    {
      "@type": "WebSite",
      "@id": `${home}#website`,
      url: home,
      name: "Spider Identifier",
      description: "AI-powered spider identification by picture.",
      publisher: { "@id": `${home}#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${home}#organization`,
      name: "Spider Identifier",
      url: home,
      email: "hello@spideridentifier.online",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@spideridentifier.online",
        url: `${siteConfig.url}/contact`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${home}#software`,
      name: "Spider Identifier",
      applicationCategory: "UtilitiesApplication",
      applicationSubCategory: "Spider Identification Tool",
      operatingSystem: "Web Browser",
      url: `${siteConfig.url}/#identify`,
      downloadUrl: `${siteConfig.url}/#identify`,
      description:
        "Free AI-powered Spider Identifier by Picture tool that helps users identify spider species from uploaded images. Recognizes Wolf Spiders, Jumping Spiders, Orb Weavers, House Spiders, Black Widows, Brown Recluses, Cellar Spiders, Funnel Weaver Spiders, Crab Spiders, Tarantulas, and many other species.",
      featureList: [
        "Spider identification by picture",
        "AI image recognition",
        "Spider species detection",
        "House spider identification",
        "Venomous spider identification",
        "Spider family recognition",
        "Spider comparison tool",
        "Photo-based spider scanner",
        "Mobile-friendly spider identification",
        "Free online spider identifier",
      ],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
      provider: { "@id": `${home}#organization` },
      keywords: [
        "Spider Identifier",
        "Spider Identifier By Picture",
        "Spider Identifier Online",
        "Free Spider Identifier",
        "Spider AI Scanner",
        "House Spider Identifier",
        "Spider Recognition",
        "Spider Species Identification",
        "Spider Image Recognition",
        "Identify Spider From Photo",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${home}#howto`,
      name: "How to Identify a Spider by Picture",
      description: "Learn how to identify a spider using a photo and AI-powered spider recognition.",
      step: [
        { "@type": "HowToStep", name: "Take a Clear Photo", text: "Photograph the spider in good lighting and capture its body shape, markings, legs, and web if visible." },
        { "@type": "HowToStep", name: "Upload the Image", text: "Upload your spider photo to the Spider Identifier tool." },
        { "@type": "HowToStep", name: "Analyze the Results", text: "Review the AI-generated species matches and identification details." },
        { "@type": "HowToStep", name: "Compare Characteristics", text: "Compare habitat, web structure, anatomy, and behavior traits to verify identification." },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${home}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: home },
        { "@type": "ListItem", position: 2, name: "Spider Identifier", item: `${siteConfig.url}/#identify` },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${home}#faq`,
      mainEntity: [
        { "@type": "Question", name: "What spider is this?", acceptedAnswer: { "@type": "Answer", text: "Upload a clear photo to our Spider Identifier tool to identify spider species using AI image recognition technology." } },
        { "@type": "Question", name: "Can AI identify spiders accurately?", acceptedAnswer: { "@type": "Answer", text: "Yes. AI-powered spider identification tools can recognize many common spider species from high-quality photos." } },
        { "@type": "Question", name: "Is the Spider Identifier free?", acceptedAnswer: { "@type": "Answer", text: "Yes. Spider Identifier is a free online tool that helps users identify spiders from uploaded images." } },
        { "@type": "Question", name: "Can I identify a spider from a blurry photo?", acceptedAnswer: { "@type": "Answer", text: "Clear photos provide the most accurate results. Blurry images may reduce identification accuracy." } },
        { "@type": "Question", name: "Can the tool identify venomous spiders?", acceptedAnswer: { "@type": "Answer", text: "Yes. The tool can help identify species such as Black Widow Spiders and Brown Recluse Spiders among many others." } },
        { "@type": "Question", name: "Does Spider Identifier work on mobile devices?", acceptedAnswer: { "@type": "Answer", text: "Yes. The Spider Identifier tool is fully optimized for smartphones, tablets, and desktop devices." } },
      ],
    },
  ],
};
