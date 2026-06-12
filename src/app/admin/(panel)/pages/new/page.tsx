import { PostEditor, type InterlinkCandidate } from "@/components/admin/PostEditor";
import { getBlogPosts, getSpecies } from "@/lib/data";
import { getSiteContent } from "@/lib/siteContent";
import { DEFAULT_EDITOR_OPTIONS, type EditorOptions } from "@/lib/siteDefaults";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [posts, species, options] = await Promise.all([
    getBlogPosts(),
    getSpecies(),
    getSiteContent<EditorOptions>("editor_options", DEFAULT_EDITOR_OPTIONS),
  ]);
  const interlinks: InterlinkCandidate[] = [
    ...species.map((s) => ({ phrase: s.common_name, href: `/species/${s.slug}` })),
    ...posts.map((p) => ({ phrase: p.title.split(":")[0]?.trim() ?? p.title, href: `/${p.slug}` })),
  ];
  return <PostEditor interlinks={interlinks} options={{ ...DEFAULT_EDITOR_OPTIONS, ...options }} />;
}
