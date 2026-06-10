import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { blogPosts as fallbackPosts } from "@/content/blog";
import { speciesLibrary as fallbackSpecies } from "@/content/species";
import type { BlogPost, Species } from "@/lib/types";

/**
 * Data layer. Reads from Supabase when configured, otherwise transparently
 * falls back to the bundled content so the site is fully functional on first
 * run — before any keys are added.
 */

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (supabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase!
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (!error && data && data.length) return data as BlogPost[];
    } catch {
      // fall through to bundled content
    }
  }
  return [...fallbackPosts].sort(
    (a, b) => +new Date(b.published_at) - +new Date(a.published_at)
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (supabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase!
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (data) return data as BlogPost;
    } catch {
      // fall through
    }
  }
  return fallbackPosts.find((p) => p.slug === slug) ?? null;
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
  if (supabaseConfigured) {
    try {
      const supabase = await createClient();
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
