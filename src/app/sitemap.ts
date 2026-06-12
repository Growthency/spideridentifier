import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getBlogPosts, getSpecies } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes = ["", "/species", "/anatomy", "/blog", "/pricing", "/about", "/contact", "/privacy", "/terms", "/refund", "/disclaimer"];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Live content (Supabase when configured, bundled fallback otherwise) so
  // admin-published posts are picked up without a redeploy.
  const [posts, species] = await Promise.all([getBlogPosts(), getSpecies()]);

  for (const post of posts) {
    routes.push({
      url: `${base}/${post.slug}`,
      lastModified: new Date(post.published_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const s of species) {
    routes.push({
      url: `${base}/species/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return routes;
}
