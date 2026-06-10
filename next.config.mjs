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
  images: {
    // We ship WebP only. Allow optimized WebP/AVIF output for any remote asset.
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // Keep the first production build friction-free for the client.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
