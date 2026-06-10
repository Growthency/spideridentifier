/** Homepage content — every section is real, sourced from arachnology basics. */

export const heroRotatingWords = [
  "in seconds.",
  "from one photo.",
  "with venom alerts.",
  "anywhere on Earth.",
];

export const trustBadges = ["AI-POWERED", "50,000+ SPECIES", "VENOM RISK ALERTS", "100% FREE TO TRY"];

export const howItWorks = [
  {
    icon: "Camera",
    title: "Capture or upload",
    desc: "Take a clear, well-lit photo of the spider — or upload one you already have. A side angle showing the legs and body works best.",
  },
  {
    icon: "ScanSearch",
    title: "Detection & isolation",
    desc: "Computer vision locates the spider and separates it from leaves, walls and shadows so only the animal is analysed.",
  },
  {
    icon: "Fingerprint",
    title: "Feature extraction",
    desc: "The model measures leg proportions, body segmentation, colour patterns, markings and — where visible — eye arrangement.",
  },
  {
    icon: "Brain",
    title: "Model prediction",
    desc: "Those features are matched against a dataset trained on thousands of labelled images to rank the most likely species.",
  },
  {
    icon: "ShieldCheck",
    title: "Result + venom risk",
    desc: "You get the top matches with a confidence score and a clear venom-risk indicator — in under three seconds.",
  },
];

export const whyAccurate = [
  {
    icon: "Microscope",
    title: "Arachnology-based analysis",
    desc: "Beyond raw pixels, predictions are refined with real biology — eye arrangement, leg stance and web type sharpen the match.",
  },
  {
    icon: "ShieldAlert",
    title: "Venom-risk indicators",
    desc: "Every result is flagged harmless, mild, caution or dangerous, so you instantly know whether to keep your distance.",
  },
  {
    icon: "Copy",
    title: "Look-alike detection",
    desc: "Brown recluse vs harmless cellar spider, widow vs false widow — the model surfaces the differences that matter.",
  },
  {
    icon: "Layers",
    title: "Multi-feature matching",
    desc: "Body shape, leg banding, markings and posture are weighed together — not a single trait that a blurry photo could fake.",
  },
  {
    icon: "Globe2",
    title: "Global species coverage",
    desc: "From house spiders to the Brazilian wandering spider, the dataset spans common and medically significant species worldwide.",
  },
  {
    icon: "LifeBuoy",
    title: "Safety-first guidance",
    desc: "Suspected dangerous species come with clear next-step advice — because an identification should help you stay safe.",
  },
];

/** "What the AI looks at" — sourced from the spider anatomy guide. */
export const visualSignals = [
  {
    label: "Body shape",
    detail: "A round, bulbous abdomen versus a long, slender one is one of the first things the model weighs.",
  },
  {
    label: "Legs",
    detail: "Length, thickness, hairiness and stance — a crab-like splay reads very differently from a tight, upright pose.",
  },
  {
    label: "Patterns",
    detail: "Stripes, spots, an hourglass or a violin shape are decisive markings for high-risk species.",
  },
  {
    label: "Eyes",
    detail: "Arrangement and size — two huge eyes signal a jumper; six in three pairs hints at a recluse.",
  },
  {
    label: "Web clues",
    detail: "If a web is visible, an orb, a funnel, a sheet or a tangled cobweb each narrows the family quickly.",
  },
];

export const comparison = {
  columns: ["Spider Identifier", "Field Guide", "Generic Photo App"],
  rows: [
    { feature: "Speed", values: ["Instant (< 3s)", "Slow page-flipping", "Fast"] },
    { feature: "Venom risk alerts", values: ["Built in", "Manual cross-reference", "None"] },
    { feature: "Look-alike warnings", values: ["Yes", "Sometimes", "Rarely"] },
    { feature: "Arachnology-tuned", values: ["Yes", "Yes (expert needed)", "No"] },
    { feature: "Beginner friendly", values: ["Designed for it", "Requires expertise", "Generic results"] },
    { feature: "Works on mobile", values: ["Yes", "Carry a book", "Yes"] },
  ],
};

export const guideCategories = [
  { title: "Venomous Spider Identification", href: "/blog", emoji: "⚠️" },
  { title: "Black Widow Identification", href: "/blog/black-widow-spider-identification", emoji: "⏳" },
  { title: "Brown Recluse Identification", href: "/blog/brown-recluse-spider-identification", emoji: "🎻" },
  { title: "House Spiders", href: "/species/common-house-spider", emoji: "🏠" },
  { title: "Garden & Orb Weavers", href: "/species/garden-orb-weaver", emoji: "🕸️" },
  { title: "Jumping Spiders", href: "/species/jumping-spider", emoji: "👀" },
  { title: "Wolf Spiders", href: "/species/wolf-spider", emoji: "🐺" },
  { title: "Tarantulas", href: "/species/tarantula", emoji: "🦂" },
  { title: "Spider Bites & Safety", href: "/blog/spider-bites-identify-treat-when-to-worry", emoji: "🩹" },
  { title: "Spider Anatomy", href: "/anatomy", emoji: "🔬" },
  { title: "Spider Webs Explained", href: "/anatomy#webs", emoji: "🧵" },
  { title: "Perfect Spider Photo", href: "/blog/perfect-spider-photo-for-ai-identification", emoji: "📷" },
];

export const faqs = [
  {
    q: "Can AI really identify spiders accurately?",
    a: "Yes. With a clear, well-lit image, machine-learning models reach high accuracy for common, distinctive species. Accuracy drops for blurry photos, juveniles, or species that can only be separated under a microscope — which is why we always show a confidence score rather than a false guarantee.",
  },
  {
    q: "Do I need to download an app?",
    a: "No. Spider Identifier runs entirely in your browser on any phone, tablet or computer. There is nothing to install — just open the page and upload a photo.",
  },
  {
    q: "What kind of photo works best?",
    a: "A sharp, close-up image in good light showing the spider's body, legs and any markings. A slight side angle that reveals the body shape and leg stance gives the model far more to work with than a top-down silhouette.",
  },
  {
    q: "Can it detect dangerous spiders?",
    a: "It flags medically significant species such as black widows, brown recluses and wandering spiders with a clear venom-risk indicator. Treat every flag as a reason for caution — and never handle a spider you suspect is dangerous.",
  },
  {
    q: "Does it use my location?",
    a: "Regional data can meaningfully improve accuracy because many species are limited to certain areas. Location is optional and only used to refine the ranking when you choose to share it.",
  },
  {
    q: "Is the identification a guaranteed diagnosis?",
    a: "No. The tool returns the closest match, not a 100% confirmed identification. For a suspected venomous bite or any medical concern, seek professional or medical advice immediately rather than relying on a photo.",
  },
  {
    q: "Is it free?",
    a: "Identifying a spider is free to try. You can upload a photo and get a result with venom-risk guidance without creating an account.",
  },
  {
    q: "Which spiders are covered?",
    a: "The dataset spans house spiders, wolf spiders, orb-weavers, jumping spiders, widows, recluses, huntsmen, tarantulas and many more — across 190+ countries, including the species most likely to turn up in and around homes.",
  },
];
