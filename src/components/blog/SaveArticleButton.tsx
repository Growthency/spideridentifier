"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { dialogAlert } from "@/components/ui/Dialog";

/**
 * Heart toggle on blog articles — saves the post to the user's dashboard
 * "Saved Articles". Writes go through the server so a missing profile row
 * is healed automatically; guests are sent to login first.
 */
export function SaveArticleButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setSignedIn(true);
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_slug", slug)
        .maybeSingle();
      setSaved(Boolean(data));
    };
    load();
  }, [slug]);

  async function toggle() {
    if (!signedIn) {
      router.push(`/login?next=/${slug}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const text = await res.text();
      let json: { saved?: boolean; error?: string };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Server returned ${res.status} — please try again`);
      }
      if (!res.ok) throw new Error(json.error || "Could not save");
      setSaved(Boolean(json.saved));
    } catch (e) {
      dialogAlert(e instanceof Error ? e.message : "Could not save", "Saved articles");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from saved articles" : "Save article"}
      title={saved ? "Remove from saved articles" : "Save article"}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        saved
          ? "border-red-400/40 bg-red-500/10 text-red-500"
          : "border-foreground/10 bg-card/60 text-foreground/60 hover:border-red-400/40 hover:text-red-500"
      }`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
