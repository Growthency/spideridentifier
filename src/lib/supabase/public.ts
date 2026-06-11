import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const publicConfigured = Boolean(
  url && anon && !url.includes("YOUR_") && !anon.includes("YOUR_")
);

let cached: SupabaseClient | null = null;

/**
 * Cookie-less, read-only Supabase client for public content (blog posts,
 * species). Unlike the SSR client this never touches request cookies, so
 * pages that use it stay fully static / ISR — Google and visitors get
 * pre-rendered HTML with a fast TTFB instead of a per-request render.
 */
export function createPublicClient(): SupabaseClient | null {
  if (!publicConfigured) return null;
  if (!cached) {
    cached = createSupabaseClient(url!, anon!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
