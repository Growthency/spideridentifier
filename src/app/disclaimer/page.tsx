import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { disclaimerDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "Safety Disclaimer",
  description: "Important safety information about using Spider Identifier and its results.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return <LegalLayout doc={disclaimerDoc} />;
}
