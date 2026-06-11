import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { termsDoc } from "@/content/legal";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern your use of Spider Identifier.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalLayout doc={termsDoc} />;
}
