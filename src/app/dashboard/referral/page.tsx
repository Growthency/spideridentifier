import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReferralClient } from "@/components/dashboard/ReferralClient";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const profile = await getProfile();
  // Count referred signups with the admin client — RLS hides other profiles
  // from the user's own session, so this must happen server-side.
  let count = 0;
  const admin = createAdminClient();
  if (admin && profile) {
    const { count: c } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", profile.id);
    count = c ?? 0;
  }

  return <ReferralClient code={profile?.referral_code ?? ""} count={count} />;
}
