"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-300">
        <Check className="h-4 w-4" /> You are on the list — thanks for subscribing!
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="h-11 w-full rounded-full border border-foreground/10 bg-foreground/5 px-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        aria-label="Subscribe"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-gradient text-ink-950 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
