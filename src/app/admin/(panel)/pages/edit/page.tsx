import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostEditor, type InterlinkCandidate } from "@/components/admin/PostEditor";
import { getBlogPosts, getSpecies } from "@/lib/data";
import { getSiteContent } from "@/lib/siteContent";
import { DEFAULT_EDITOR_OPTIONS, type EditorOptions } from "@/lib/siteDefaults";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Clean edit URL: /admin/pages/edit?slug=<post-slug> (id also accepted). */
export default async function EditPostPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; id?: string }>;
}) {
  const { slug, id } = await searchParams;
  const supabase = createAdminClient();
  if (!supabase || (!slug && !id)) notFound();

  let query = supabase.from("blog_posts").select("*");
  query = slug ? query.eq("slug", slug) : query.eq("id", id);
  const [{ data }, posts, species, options] = await Promise.all([
    query.maybeSingle(),
    getBlogPosts(),
    getSpecies(),
    getSiteContent<EditorOptions>("editor_options", DEFAULT_EDITOR_OPTIONS),
  ]);
  if (!data) notFound();

  const interlinks: InterlinkCandidate[] = [
    ...species.map((s) => ({ phrase: s.common_name, href: `/species/${s.slug}` })),
    ...posts.map((p) => ({ phrase: p.title.split(":")[0]?.trim() ?? p.title, href: `/${p.slug}` })),
  ];

  return <PostEditor post={data as BlogPost} interlinks={interlinks} options={{ ...DEFAULT_EDITOR_OPTIONS, ...options }} />;
}
