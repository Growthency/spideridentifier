import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostEditor, type InterlinkCandidate } from "@/components/admin/PostEditor";
import { getBlogPosts, getSpecies } from "@/lib/data";
import { getSiteContent } from "@/lib/siteContent";
import { DEFAULT_EDITOR_OPTIONS, type EditorOptions } from "@/lib/siteDefaults";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) notFound();

  const [{ data }, posts, species, options] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).maybeSingle(),
    getBlogPosts(),
    getSpecies(),
    getSiteContent<EditorOptions>("editor_options", DEFAULT_EDITOR_OPTIONS),
  ]);
  if (!data) notFound();

  const interlinks: InterlinkCandidate[] = [
    ...species.map((s) => ({ phrase: s.common_name, href: `/species/${s.slug}` })),
    ...posts.map((p) => ({ phrase: p.title.split(":")[0]?.trim() ?? p.title, href: `/blog/${p.slug}` })),
  ];

  return <PostEditor post={data as BlogPost} interlinks={interlinks} options={{ ...DEFAULT_EDITOR_OPTIONS, ...options }} />;
}
