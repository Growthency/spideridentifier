import { redirect } from "next/navigation";
import { getSessionUser, getProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  const profile = await getProfile();
  // Sensible defaults when the profile row hasn't landed yet (first OAuth login).
  const safeProfile: Profile = profile ?? {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    avatar_url: null,
    country: null,
    credits: 30,
    total_identifications: 0,
    plan: "free",
    referral_code: null,
    referred_by: null,
    subscription_id: null,
    subscription_status: null,
    current_period_end: null,
    paddle_customer_id: null,
    created_at: new Date().toISOString(),
  };

  return (
    <DashboardShell profile={safeProfile} email={user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}
