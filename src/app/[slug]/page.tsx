import { notFound, permanentRedirect } from "next/navigation";
import { getBlogPost, getSpeciesBySlugData } from "@/lib/data";

export const revalidate = 3600;

/**
 * Root-level short links: spideridentifier.online/<slug> resolves articles
 * and species, matching the permalink shown in the editor. The canonical
 * URLs stay at /blog/<slug> and /species/<slug>, so SEO is unaffected.
 */
export default async function RootSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/i.test(slug)) notFound();

  const post = await getBlogPost(slug);
  if (post) permanentRedirect(`/blog/${post.slug}`);

  const species = await getSpeciesBySlugData(slug);
  if (species) permanentRedirect(`/species/${species.slug}`);

  notFound();
}
