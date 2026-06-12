import { getSiteContent } from "@/lib/siteContent";
import { FooterSettingsEditor } from "@/components/admin/FooterSettingsEditor";
import { DEFAULT_FOOTER, type FooterContent } from "@/lib/siteDefaults";

export const dynamic = "force-dynamic";

export default async function FooterSettingsAdmin() {
  const footer = await getSiteContent<FooterContent>("footer", DEFAULT_FOOTER);
  return <FooterSettingsEditor initial={{ ...DEFAULT_FOOTER, ...footer }} />;
}
