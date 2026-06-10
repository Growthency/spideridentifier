"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True only when Supabase env vars are present. */
export const supabaseConfigured = Boolean(url && anon);

/**
 * Browser Supabase client. Returns null when env vars are not yet configured,
 * so the UI can fall back to bundled content during local preview.
 */
export function createClient() {
  if (!supabaseConfigured) return null;
  return createBrowserClient(url!, anon!);
}
