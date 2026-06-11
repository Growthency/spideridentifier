import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { refundDoc } from "@/content/legal";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Spider Identifier's free trial, 14-day money-back guarantee and cancellation policy. Payments handled by Paddle.",
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return <LegalLayout doc={refundDoc} />;
}
