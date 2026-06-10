export interface PricingTier {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number; // per month, billed yearly
  highlighted?: boolean;
  cta: { label: string; href: string };
  features: string[];
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    tagline: "Everything you need to identify the spider on your wall.",
    monthly: 0,
    yearly: 0,
    cta: { label: "Start free", href: "/identify" },
    features: [
      "5 identifications per day",
      "Venom-risk indicator on every result",
      "Confidence score & top-3 matches",
      "Full species library access",
      "All identification blog guides",
    ],
  },
  {
    name: "Pro",
    tagline: "For the curious, the cautious and the spider-obsessed.",
    monthly: 9,
    yearly: 7,
    highlighted: true,
    cta: { label: "Go Pro", href: "/contact" },
    features: [
      "Unlimited identifications",
      "Full species profiles & look-alike alerts",
      "Location-based accuracy boost",
      "Identification history & saved spiders",
      "Priority processing",
      "Email support",
    ],
  },
  {
    name: "Expert",
    tagline: "For researchers, educators and pest-control teams.",
    monthly: 29,
    yearly: 24,
    cta: { label: "Talk to us", href: "/contact" },
    features: [
      "Everything in Pro",
      "API access for your own apps",
      "Bulk image identification",
      "3 team seats included",
      "CSV export & reporting",
      "Dedicated priority support",
    ],
  },
];

export const pricingFaqs = [
  {
    q: "Is it really free to try?",
    a: "Yes. You can identify spiders on the Free plan with no credit card and no account required. Upgrade only when you want unlimited IDs and the advanced features.",
  },
  {
    q: "Can I change or cancel my plan anytime?",
    a: "Absolutely. Plans are month-to-month (or yearly for a discount) and you can upgrade, downgrade or cancel whenever you like — no lock-in.",
  },
  {
    q: "What happens when I hit the free daily limit?",
    a: "You can keep browsing the species library and guides, and your limit resets every day. Upgrade to Pro for unlimited identifications.",
  },
  {
    q: "Do you offer plans for schools or teams?",
    a: "Yes — the Expert plan includes team seats, and we offer custom education and research pricing. Get in touch and we'll sort you out.",
  },
];
