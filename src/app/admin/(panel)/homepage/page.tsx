import { getSiteContent } from "@/lib/siteContent";
import { HomepageEditor } from "@/components/admin/HomepageEditor";
import { DEFAULT_HOMEPAGE, type HomepageContent } from "@/lib/siteDefaults";

export const dynamic = "force-dynamic";

export default async function HomepageAdmin() {
  const home = await getSiteContent<HomepageContent>("homepage", DEFAULT_HOMEPAGE);
  return <HomepageEditor initial={{ ...DEFAULT_HOMEPAGE, ...home }} />;
}
