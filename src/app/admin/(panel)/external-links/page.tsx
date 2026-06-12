import { createAdminClient } from "@/lib/supabase/admin";
import { ExternalLinksEditor } from "@/components/admin/ExternalLinksEditor";
import type { ExternalLinkRule } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export default async function ExternalLinksAdmin() {
  const admin = createAdminClient();
  let rules: ExternalLinkRule[] = [];
  if (admin) {
    const { data } = await admin.from("external_link_rules").select("*").order("domain", { ascending: true });
    rules = (data as ExternalLinkRule[]) ?? [];
  }
  return <ExternalLinksEditor initial={rules} configured={Boolean(admin)} />;
}
