import type { Metadata } from "next";
import { Mail, MessageSquare, Clock, ScanSearch } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Get in Touch",
  description:
    "Questions about a spider, a partnership, or feedback on the tool? Contact the Spider Identifier team — we usually reply within one to two business days.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Let&apos;s <span className="text-gradient">talk spiders</span></>}
        subtitle="Whether you've found a spider you can't place, spotted a bug, or want to work together — we'd love to hear from you."
      />

      <section className="relative pb-16">
        <div className="container-px">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ContactForm />
            </div>

            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-3xl border border-foreground/8 bg-card/50 p-6">
                <Mail className="h-6 w-6 text-gold" />
                <h3 className="mt-3 font-display text-base font-bold">Email us</h3>
                <p className="mt-1 text-sm text-foreground/60">For anything at all, reach us directly at:</p>
                <a href={`mailto:${siteConfig.email}`} className="mt-2 inline-block text-sm font-medium text-gold hover:underline">
                  {siteConfig.email}
                </a>
              </div>

              <div className="rounded-3xl border border-foreground/8 bg-card/50 p-6">
                <Clock className="h-6 w-6 text-gold" />
                <h3 className="mt-3 font-display text-base font-bold">Response time</h3>
                <p className="mt-1 text-sm text-foreground/60">
                  We typically reply within one to two business days. For a fast spider ID, the tool is instant.
                </p>
              </div>

              <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-crimson/10 p-6">
                <MessageSquare className="h-6 w-6 text-gold" />
                <h3 className="mt-3 font-display text-base font-bold">Need an ID right now?</h3>
                <p className="mt-1 text-sm text-foreground/60">
                  Skip the wait — upload a photo and get an instant species match.
                </p>
                <Button href="/identify" size="sm" className="mt-4">
                  <ScanSearch className="h-4 w-4" /> Identify a spider
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
