import { createClient } from "@/lib/supabase/server";

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

/** True only if the signed-in user's email is in the admin allowlist. */
export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user?.email) return false;
  const list = adminEmails();
  return list.length > 0 && list.includes(user.email.toLowerCase());
}
