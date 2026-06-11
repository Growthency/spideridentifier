import { redirect } from "next/navigation";
import { getSessionUser, getProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  const profile = await getProfile();
  const name = profile?.full_name || user.email?.split("@")[0] || "Spider fan";

  return (
    <DashboardShell
      name={name}
      email={user.email ?? ""}
      credits={profile?.credits ?? 0}
      plan={profile?.plan ?? "free"}
      avatar={profile?.avatar_url}
    >
      {children}
    </DashboardShell>
  );
}
