import { getSiteContent } from "@/lib/siteContent";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { DEFAULT_THEME, type ThemeColors } from "@/lib/siteDefaults";

export const dynamic = "force-dynamic";

export default async function ThemeAdmin() {
  const theme = await getSiteContent<ThemeColors>("theme", DEFAULT_THEME);
  return <ThemeEditor initial={{ ...DEFAULT_THEME, ...theme }} />;
}
