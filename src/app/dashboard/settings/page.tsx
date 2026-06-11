import { getProfile, getSessionUser } from "@/lib/auth";
import { SettingsClient } from "@/components/dashboard/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-foreground/55">Manage your profile, account and subscription.</p>
      <SettingsClient
        email={user?.email ?? ""}
        fullName={profile?.full_name ?? ""}
        country={profile?.country ?? ""}
        avatar={profile?.avatar_url ?? null}
        plan={profile?.plan ?? "free"}
        periodEnd={profile?.current_period_end ?? null}
      />
    </div>
  );
}
