/** Server-safe types + defaults for admin-managed site content. */

export interface ThemeColors {
  accentA: string;
  accentB: string;
  accentC: string;
}

export const DEFAULT_THEME: ThemeColors = {
  accentA: "#10b981",
  accentB: "#22c55e",
  accentC: "#0d9488",
};

export interface FooterContent {
  description: string;
  contact_email: string;
  newsletter_heading: string;
  newsletter_sub: string;
  accept_label: string;
  secured_line: string;
  copyright: string;
  safety_note: string;
}

export const DEFAULT_FOOTER: FooterContent = {
  description:
    "AI-powered spider identification — instant species ID, venom-risk indicators and look-alike alerts you can trust.",
  contact_email: "hello@spideridentifier.online",
  newsletter_heading: "Spider field notes, monthly.",
  newsletter_sub: "New identification guides, species spotlights and safety tips — no spam, unsubscribe anytime.",
  accept_label: "We accept",
  secured_line: "Secured by Paddle · 256-bit SSL encryption",
  copyright: "Spider Identifier. All rights reserved.",
  safety_note:
    "Spider Identifier provides the closest AI match, not a guaranteed identification or medical diagnosis. Never handle a spider you suspect is venomous, and for any suspected bite seek professional medical advice immediately.",
};

export interface HomepageContent {
  eyebrow: string;
  title_static: string;
  subtitle: string;
  cta_primary: string;
  cta_secondary: string;
}

export const DEFAULT_HOMEPAGE: HomepageContent = {
  eyebrow: "AI-Powered Arachnology",
  title_static: "any spider",
  subtitle:
    "Upload a single photo and discover the species in seconds — complete with venom-risk indicators, look-alike alerts, habitat data and expert guides. Free to try, no app required.",
  cta_primary: "Identify a Spider",
  cta_secondary: "Browse species",
};

/** Dropdown options in the post editor — admin can add/remove entries. */
export interface EditorOptions {
  categories: string[];
  levels: string[];
  regions: string[];
  cover_accents: string[];
}

export const DEFAULT_EDITOR_OPTIONS: EditorOptions = {
  categories: ["Species Guide", "Identification", "Safety", "Behavior", "Photography", "Comparison Guide", "Educational"],
  levels: ["Beginner", "Intermediate", "Advanced"],
  regions: ["Worldwide", "North America", "South America", "Europe", "Asia", "Africa", "Australia"],
  cover_accents: ["gold", "crimson", "dual"],
};

/** Override CSS for non-default theme colors (brand gradient + accents). */
export function themeOverrideCss(t: ThemeColors): string {
  if (t.accentA === DEFAULT_THEME.accentA && t.accentB === DEFAULT_THEME.accentB && t.accentC === DEFAULT_THEME.accentC) {
    return "";
  }
  const grad = `linear-gradient(120deg, ${t.accentA} 0%, ${t.accentB} 45%, ${t.accentC} 100%)`;
  return [
    `.bg-brand-gradient{background-image:${grad} !important}`,
    `.text-gradient,.text-gradient-animate{background-image:${grad} !important}`,
    `.text-gold{color:${t.accentA} !important}`,
    `.bg-gold{background-color:${t.accentA} !important}`,
    `.stroke-gold{stroke:${t.accentA} !important}`,
  ].join("\n");
}
