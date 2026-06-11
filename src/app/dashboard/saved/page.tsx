import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getBlogPosts } from "@/lib/data";
import { BlogCard } from "@/components/ui/BlogCard";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  let slugs: string[] = [];
  if (supabase && profile) {
    const { data } = await supabase.from("favorites").select("post_slug").eq("user_id", profile.id);
    slugs = (data ?? []).map((f: { post_slug: string }) => f.post_slug);
  }
  const posts = (await getBlogPosts()).filter((p) => slugs.includes(p.slug));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold">Saved guides</h1>
      <p className="mt-1 text-sm text-foreground/55">Blog guides you&apos;ve bookmarked for later.</p>

      {posts.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-3xl border border-foreground/8 bg-card/50 p-16 text-center">
          <Bookmark className="h-10 w-10 text-foreground/30" />
          <p className="mt-4 font-medium">Nothing saved yet</p>
          <p className="mt-1 text-sm text-foreground/50">Bookmark guides from the blog to find them here.</p>
          <Link href="/blog" className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950">
            Browse the blog
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
