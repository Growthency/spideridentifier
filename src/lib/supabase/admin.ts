import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const adminConfigured = Boolean(url && serviceKey);

/**
 * Service-role Supabase client. SERVER ONLY — bypasses Row Level Security.
 * Used for the admin dashboard, WebP upload route and seeding.
 */
export function createAdminClient() {
  if (!adminConfigured) return null;
  return createClient(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
