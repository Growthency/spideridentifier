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

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  credits: number;
  total_identifications: number;
  plan: "free" | "starter" | "explorer" | "pro";
  referral_code: string | null;
  referred_by: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  paddle_customer_id: string | null;
  created_at: string;
}

export interface Analysis {
  id: string;
  user_id: string | null;
  image_url: string | null;
  image_urls: string[];
  result: {
    commonName: string;
    scientificName: string;
    family?: string;
    venomLevel: VenomLevel;
    confidence: string;
    summary?: string;
    identification?: string[];
    habitat?: string;
    region?: string;
    lookAlikes?: string[];
    recommendedAction?: string;
    funFact?: string;
  };
  credits_used: number;
  notes: string | null;
  created_at: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}
