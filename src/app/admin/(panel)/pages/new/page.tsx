import { PostEditor, type InterlinkCandidate } from "@/components/admin/PostEditor";
import { getBlogPosts, getSpecies } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [posts, species] = await Promise.all([getBlogPosts(), getSpecies()]);
  const interlinks: InterlinkCandidate[] = [
    ...species.map((s) => ({ phrase: s.common_name, href: `/species/${s.slug}` })),
    ...posts.map((p) => ({ phrase: p.title.split(":")[0]?.trim() ?? p.title, href: `/blog/${p.slug}` })),
  ];
  return <PostEditor interlinks={interlinks} />;
}
