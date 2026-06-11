import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SignupPageClient } from "@/components/auth/SignupPageClient";

export const metadata: Metadata = pageMetadata({
  title: "Create Your Free Account",
  description: "Join Spider Identifier free — 30 credits included, no credit card required. Identify spiders by photo with venom-risk alerts.",
  path: "/signup",
  noIndex: true,
});

export default function SignupPage() {
  return <SignupPageClient />;
}
