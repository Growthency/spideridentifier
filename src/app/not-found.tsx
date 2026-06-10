import Link from "next/link";
import { Home, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SpiderMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <section className="relative grid min-h-[70vh] place-items-center px-5 pt-24">
      <div className="text-center">
        <div className="relative mx-auto mb-6 w-fit">
          <SpiderMark className="h-20 w-20 animate-float" />
          <span className="absolute inset-0 -z-10 rounded-full bg-gold/20 blur-2xl" />
        </div>
        <p className="font-display text-7xl font-extrabold text-gradient sm:text-8xl">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">This web leads nowhere</h1>
        <p className="mx-auto mt-3 max-w-md text-foreground/60">
          The page you&apos;re looking for has scuttled off. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" size="lg">
            <Home className="h-5 w-5" /> Back home
          </Button>
          <Button href="/#identify" variant="secondary" size="lg">
            <ScanSearch className="h-5 w-5" /> Identify a spider
          </Button>
        </div>
      </div>
    </section>
  );
}
