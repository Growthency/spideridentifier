import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { HistoryClient } from "@/components/dashboard/HistoryClient";
import type { Analysis } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  let analyses: Analysis[] = [];
  if (supabase && profile) {
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    analyses = (data as Analysis[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold">Scan history</h1>
      <p className="mt-1 text-sm text-foreground/55">Every spider you&apos;ve identified, saved to your account.</p>
      <HistoryClient initial={analyses} />
    </div>
  );
}
