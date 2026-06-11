import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, Linkedin, Mail, AlertTriangle, Lock } from "lucide-react";
import { PaymentBadges } from "@/components/layout/PaymentBadges";
import { Logo } from "@/components/brand/Logo";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { siteConfig, footerNav } from "@/lib/site";

const iconMap = { instagram: Instagram, twitter: Twitter, facebook: Facebook, youtube: Youtube, linkedin: Linkedin };

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-foreground/8">
      <div className="container-px py-16">
        {/* newsletter band */}
        <div className="gradient-border mb-16 overflow-hidden rounded-4xl p-8 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-md">
              <h3 className="font-display text-2xl font-bold">Spider field notes, monthly.</h3>
              <p className="mt-2 text-sm text-foreground/60">
                New identification guides, species spotlights and safety tips — no spam, unsubscribe anytime.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          {/* brand */}
          <div className="col-span-2 md:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground/55">
              AI-powered spider identification — instant species ID, venom-risk indicators and look-alike
              alerts you can trust.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-gold"
            >
              <Mail className="h-4 w-4" /> {siteConfig.email}
            </a>
            <div className="mt-5 flex items-center gap-2">
              {siteConfig.social.map((s) => {
                const Icon = iconMap[s.icon as keyof typeof iconMap];
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="grid h-9 w-9 place-items-center rounded-full glass text-foreground/70 transition-all hover:-translate-y-0.5 hover:text-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* link columns */}
          {Object.values(footerNav).map((col) => (
            <div key={col.title} className="md:col-span-3 lg:col-span-2">
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/55 transition-colors hover:text-gold"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* payments & trust */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-foreground/8 pt-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-foreground/50">We accept</span>
            <PaymentBadges />
          </div>
          <p className="flex items-center gap-2 text-xs text-foreground/50">
            <Lock className="h-3.5 w-3.5 text-gold" /> Secured by Paddle · 256-bit SSL encryption
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-foreground/8 pt-8 text-xs text-foreground/45 sm:flex-row">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground/70">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground/70">
              Terms
            </Link>
            <Link href="/refund" className="hover:text-foreground/70">
              Refund
            </Link>
            <Link href="/disclaimer" className="hover:text-foreground/70">
              Disclaimer
            </Link>
          </div>
        </div>

        {/* safety note — at the very bottom of the footer */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-foreground/60">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--crimson-soft))]" />
          <p>
            <strong className="text-foreground/80">Safety note:</strong> Spider Identifier provides the closest
            AI match, not a guaranteed identification or medical diagnosis. Never handle a spider you suspect is
            venomous, and for any suspected bite seek professional medical advice immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
