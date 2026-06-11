import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export const metadata: Metadata = pageMetadata({
  title: "Sign In",
  description: "Sign in to your Spider Identifier account to scan spiders, view your history and manage your plan.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginPageClient />;
}
