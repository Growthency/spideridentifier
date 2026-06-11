"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Heart toggle on blog articles — saves the post to the user's dashboard
 * "Saved Articles". Guests are sent to login first.
 */
export function SaveArticleButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
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
    const supabase = createClient();
    if (!supabase) return;
    if (!userId) {
      router.push(`/login?next=/blog/${slug}`);
      return;
    }
    setBusy(true);
    if (saved) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("post_slug", slug);
      setSaved(false);
    } else {
      await supabase.from("favorites").insert({ user_id: userId, post_slug: slug });
      setSaved(true);
    }
    setBusy(false);
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
