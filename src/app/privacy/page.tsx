import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { privacyDoc } from "@/content/legal";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Spider Identifier collects, uses and protects your information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalLayout doc={privacyDoc} />;
}
