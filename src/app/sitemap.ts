import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { blogPosts } from "@/content/blog";
import { speciesLibrary } from "@/content/species";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = ["", "/species", "/anatomy", "/blog", "/pricing", "/about", "/contact", "/privacy", "/terms", "/disclaimer"];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const post of blogPosts) {
    routes.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.published_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const s of speciesLibrary) {
    routes.push({
      url: `${base}/species/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return routes;
}
