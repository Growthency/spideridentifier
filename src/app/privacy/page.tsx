import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { privacyDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Spider Identifier collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalLayout doc={privacyDoc} />;
}
