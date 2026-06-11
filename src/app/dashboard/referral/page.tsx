import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";
import { ReferralBox } from "@/components/dashboard/ReferralBox";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  let count = 0;
  if (supabase && profile) {
    const { count: c } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", profile.id);
    count = c ?? 0;
  }
  const code = profile?.referral_code ?? "";
  const link = `${siteConfig.url}/signup?ref=${code}`;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Refer &amp; earn</h1>
      <p className="mt-1 text-sm text-foreground/55">
        Invite a friend — you both get 20 bonus credits when they sign up.
      </p>
      <ReferralBox code={code} link={link} count={count} />
    </div>
  );
}
