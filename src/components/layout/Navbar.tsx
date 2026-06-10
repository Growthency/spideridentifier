"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ScanSearch } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[3px]">
      <div
        className={cn(
          "transition-all duration-500",
          scrolled ? "py-2.5" : "py-4"
        )}
      >
        <div className="container-px">
          <nav
            className={cn(
              "flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5",
              scrolled ? "glass-card shadow-card" : "border border-transparent"
            )}
          >
            <Link href="/" aria-label="Spider Identifier home" className="shrink-0">
              <Logo />
            </Link>

            {/* desktop nav */}
            <ul className="hidden items-center gap-1 lg:flex">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "text-foreground"
                        : "text-foreground/60 hover:text-foreground"
                    )}
                  >
                    {isActive(item.href) && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full bg-foreground/8 ring-1 ring-inset ring-foreground/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button href="/#identify" size="sm" className="hidden sm:inline-flex">
                <ScanSearch className="h-4 w-4" />
                Identify Free
              </Button>
              <button
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? "Close menu" : "Open menu"}
                className="grid h-10 w-10 place-items-center rounded-full glass text-foreground lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="container-px lg:hidden"
          >
            <div className="glass-card mt-2 rounded-3xl p-3 shadow-card">
              <ul className="flex flex-col">
                {mainNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-foreground/8 text-foreground"
                          : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                      )}
                    >
                      {item.title}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="p-2 pt-3">
                <Button href="/#identify" size="lg" className="w-full">
                  <ScanSearch className="h-5 w-5" />
                  Identify a Spider — Free
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
