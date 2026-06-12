import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Guarantee a profiles row exists for this auth user. Accounts created
 * before the signup trigger was installed have no row, which breaks every
 * foreign key (favorites, comments, analyses) — heal it on first contact.
 */
export async function ensureProfile(user: User): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  try {
    const { data } = await admin.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (data) return;
    await admin.from("profiles").insert({
      id: user.id,
      email: user.email ?? null,
      full_name: (user.user_metadata?.full_name as string) ?? null,
    });
  } catch {
    // table missing entirely — the SQL setup guide covers this case
  }
}
