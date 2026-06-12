import { getSiteContent } from "@/lib/siteContent";
import { CustomCssEditor } from "@/components/admin/CustomCssEditor";

export const dynamic = "force-dynamic";

export default async function CustomCssAdmin() {
  const css = await getSiteContent<string>("custom_css", "");
  return <CustomCssEditor initial={css} />;
}
