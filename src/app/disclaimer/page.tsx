import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { disclaimerDoc } from "@/content/legal";

export const metadata: Metadata = pageMetadata({
  title: "Safety Disclaimer",
  description:
    "Important safety information about using Spider Identifier and its results.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return <LegalLayout doc={disclaimerDoc} />;
}
