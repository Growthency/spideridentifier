/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // We ship WebP only. Allow optimized AVIF/WebP output for any asset.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // Keep the first production build friction-free for the client.
  eslint: { ignoreDuringBuilds: true },
  // The identifier now lives on the home page; bounce the old route to it.
  async redirects() {
    return [
      { source: "/identify", destination: "/#identify", permanent: true },
      // Content manager moved under /admin/pages
      { source: "/admin/posts", destination: "/admin/pages", permanent: false },
      { source: "/admin/posts/:path*", destination: "/admin/pages/:path*", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        // Security headers — every route.
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Bundled photography never changes in place — cache for a year.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Homepage — short edge cache so repeat visits skip the origin while
        // fresh content still appears within a minute.
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        // Frequently updated listings & feeds.
        source: "/(blog|species|sitemap\\.xml|feed\\.xml)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        // Info pages rarely change — cache aggressively at the edge.
        source: "/(about|contact|pricing|anatomy|privacy|terms|refund|disclaimer)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
