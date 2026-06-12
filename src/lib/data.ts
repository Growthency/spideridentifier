import { createPublicClient, publicConfigured } from "@/lib/supabase/public";
import { blogPosts as fallbackPosts } from "@/content/blog";
import { speciesLibrary as fallbackSpecies } from "@/content/species";
import type { BlogPost, Species } from "@/lib/types";

/**
 * Data layer. Reads from Supabase when configured, otherwise transparently
 * falls back to the bundled content so the site is fully functional on first
 * run — before any keys are added.
 *
 * Uses the cookie-less public client so blog/species pages can be statically
 * generated (ISR) — never per-request rendered just for public content.
 */

/**
 * Database posts and the bundled starter guides live side by side: the DB
 * wins on slug collisions, everything sorts newest-first, and posts dated in
 * the future stay hidden until their publish time (scheduling).
 */
function mergePosts(db: BlogPost[]): BlogPost[] {
  const taken = new Set(db.map((p) => p.slug));
  const now = Date.now();
  return [...db, ...fallbackPosts.filter((p) => !taken.has(p.slug))]
    .filter((p) => !p.published_at || +new Date(p.published_at) <= now)
    .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at));
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  let db: BlogPost[] = [];
  if (publicConfigured) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase!
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (!error && data) db = data as BlogPost[];
    } catch {
      // fall through to bundled content
    }
  }
  return mergePosts(db);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedPosts(limit = 2): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  const featured = posts.filter((p) => p.is_featured);
  return (featured.length ? featured : posts).slice(0, limit);
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}

export async function getSpecies(): Promise<Species[]> {
  if (publicConfigured) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase!
        .from("species")
        .select("*")
        .order("common_name", { ascending: true });
      if (!error && data && data.length) return data as Species[];
    } catch {
      // fall through
    }
  }
  return fallbackSpecies;
}

export async function getSpeciesBySlugData(slug: string): Promise<Species | null> {
  const all = await getSpecies();
  return all.find((s) => s.slug === slug) ?? null;
}
