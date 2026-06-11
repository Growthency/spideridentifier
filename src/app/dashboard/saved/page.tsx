import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getBlogPosts } from "@/lib/data";
import { SavedClient, type SavedArticle } from "@/components/dashboard/SavedClient";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  let saved: SavedArticle[] = [];
  if (supabase && profile) {
    const { data } = await supabase
      .from("favorites")
      .select("id, post_slug, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    const favorites = data ?? [];
    if (favorites.length) {
      const posts = await getBlogPosts();
      const bySlug = new Map(posts.map((p) => [p.slug, p]));
      saved = favorites.map((f: { id: string; post_slug: string; created_at: string }) => {
        const post = bySlug.get(f.post_slug);
        return {
          id: f.id,
          slug: f.post_slug,
          title: post?.title ?? f.post_slug.replace(/-/g, " "),
          excerpt: post?.excerpt ?? "",
          category: post?.category ?? "",
          accent: (post?.cover_accent === "crimson" ? "crimson" : "gold") as "gold" | "crimson",
          created_at: f.created_at,
        };
      });
    }
  }

  return <SavedClient initial={saved} />;
}
