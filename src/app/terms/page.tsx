import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { termsDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Spider Identifier.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalLayout doc={termsDoc} />;
}
