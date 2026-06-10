export type VenomLevel = "harmless" | "mild" | "caution" | "dangerous";

export interface Species {
  id?: string;
  slug: string;
  common_name: string;
  scientific_name: string;
  family: string;
  venom_level: VenomLevel;
  size: string; // e.g. "Body 8–13 mm"
  region: string; // e.g. "Worldwide", "North America"
  habitat: string;
  summary: string;
  identification: string[]; // bullet identifiers
  fact: string; // a standout fact
  accent: "gold" | "crimson"; // card art accent
  is_dangerous?: boolean;
}

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // markdown
  category: string;
  tags: string[];
  author_name: string;
  author_role: string;
  read_time: number; // minutes
  region: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  cover_accent: "gold" | "crimson" | "dual";
  status: "draft" | "published";
  is_featured: boolean;
  published_at: string; // ISO
  meta_title?: string;
  meta_description?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}
