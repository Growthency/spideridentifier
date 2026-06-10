import { ScanSearch, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/fx/Reveal";
import { SpiderMark } from "@/components/brand/Logo";

export function CtaBand() {
  return (
    <section className="relative py-24">
      <div className="container-px">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/20 bg-gradient-to-br from-gold/15 via-card/60 to-crimson/15 px-6 py-16 text-center sm:px-12 sm:py-20">
            {/* glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-crimson/20 blur-3xl" />
            <SpiderMark className="mx-auto mb-6 h-14 w-14 animate-float" />

            <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              Found a spider? <span className="text-gradient">Know it in seconds.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-foreground/65 sm:text-lg">
              Upload a photo and get an instant species match with a clear venom-risk indicator. Free to try —
              no account, no app, no waiting.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button href="/identify" size="lg">
                <ScanSearch className="h-5 w-5" />
                Identify a Spider Free
              </Button>
              <Button href="/blog" variant="secondary" size="lg">
                <BookOpen className="h-5 w-5" />
                Read the guides
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
