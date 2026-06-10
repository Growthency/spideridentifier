export const siteConfig = {
  name: "Spider Identifier",
  shortName: "SpiderID",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://spideridentifier.com",
  tagline: "Identify Any Spider From a Photo — Instantly",
  description:
    "Free AI spider identifier. Upload a photo and identify spider species in seconds — with venom-risk indicators, look-alike alerts, habitat data and expert arachnology guides.",
  keywords: [
    "spider identifier",
    "identify spider by photo",
    "spider identification",
    "AI spider identifier",
    "venomous spider identification",
    "spider species finder",
    "what spider is this",
  ],
  email: "hello@spideridentifier.com",
  stats: [
    { value: "50,000+", label: "Species in dataset" },
    { value: "< 3s", label: "Average identification" },
    { value: "98%", label: "Top-match accuracy*" },
    { value: "190+", label: "Countries covered" },
  ],
  social: [
    { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { name: "X", href: "https://x.com", icon: "twitter" },
    { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { name: "YouTube", href: "https://youtube.com", icon: "youtube" },
    { name: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  ],
};

export const mainNav = [
  { title: "Home", href: "/" },
  { title: "Identify", href: "/identify" },
  { title: "Species", href: "/species" },
  { title: "Anatomy", href: "/anatomy" },
  { title: "Blog", href: "/blog" },
  { title: "Pricing", href: "/pricing" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const footerNav = {
  explore: {
    title: "Explore",
    links: [
      { title: "Spider Identifier", href: "/identify" },
      { title: "Species Library", href: "/species" },
      { title: "Spider Anatomy", href: "/anatomy" },
      { title: "Identification Blog", href: "/blog" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { title: "About Us", href: "/about" },
      { title: "Pricing", href: "/pricing" },
      { title: "Contact", href: "/contact" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Safety Disclaimer", href: "/disclaimer" },
    ],
  },
  guides: {
    title: "Popular Guides",
    links: [
      { title: "Black Widow Identification", href: "/blog/black-widow-spider-identification" },
      { title: "Brown Recluse Identification", href: "/blog/brown-recluse-spider-identification" },
      { title: "Wolf vs House Spider", href: "/blog/wolf-spider-vs-house-spider" },
      { title: "Perfect Spider Photo", href: "/blog/perfect-spider-photo-for-ai-identification" },
    ],
  },
};

export type SiteConfig = typeof siteConfig;
