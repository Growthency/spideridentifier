import { createAdminClient } from "@/lib/supabase/admin";
import { MenusEditor } from "@/components/admin/MenusEditor";
import type { MenuItem } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export default async function MenusAdmin() {
  const admin = createAdminClient();
  let items: MenuItem[] = [];
  if (admin) {
    const { data } = await admin.from("menu_items").select("*").order("sort_order", { ascending: true });
    items = (data as MenuItem[]) ?? [];
  }
  return <MenusEditor initial={items} configured={Boolean(admin)} />;
}
