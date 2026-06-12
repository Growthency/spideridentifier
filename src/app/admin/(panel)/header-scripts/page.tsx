import { createAdminClient } from "@/lib/supabase/admin";
import { HeaderScriptsEditor } from "@/components/admin/HeaderScriptsEditor";
import type { SiteScript } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export default async function HeaderScriptsAdmin() {
  const admin = createAdminClient();
  let scripts: SiteScript[] = [];
  if (admin) {
    const { data } = await admin.from("site_scripts").select("*").order("sort_order", { ascending: true });
    scripts = (data as SiteScript[]) ?? [];
  }
  return <HeaderScriptsEditor initial={scripts} configured={Boolean(admin)} />;
}
