import { notFound, permanentRedirect } from "next/navigation";
import { getBlogPost } from "@/lib/data";

export const revalidate = 3600;

/**
 * Articles moved to the site root (spideridentifier.online/<slug>) —
 * old /blog/<slug> links 301 to the new canonical location.
 */
export default async function LegacyBlogPostRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  permanentRedirect(`/${post.slug}`);
}
