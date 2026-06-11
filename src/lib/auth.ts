import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Credits charged per AI identification, and per-plan monthly allowance. */
export const CREDITS_PER_SCAN = 10;
export const GUEST_FREE_SCANS = 2;
export const PLAN_CREDITS: Record<string, number> = {
  free: 30,
  starter: 120,
  explorer: 550,
  pro: 1200,
};

/** Lowercased list of emails permitted into /admin (from ADMIN_EMAILS env). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** Current signed-in user's profile (credits, plan, etc.), or null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile) ?? null;
}

/** True only if the signed-in user's email is in the admin allowlist. */
export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user?.email) return false;
  const list = adminEmails();
  return list.length > 0 && list.includes(user.email.toLowerCase());
}
