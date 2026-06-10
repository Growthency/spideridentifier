import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const ok = await isAdmin();
  if (!ok) redirect("/admin/login?forbidden=1");

  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
