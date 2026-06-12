import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { serpApiConfigured, serpSearch, getSerpQuota } from "@/lib/serpapi";

export const maxDuration = 60;

export interface RankCheck {
  position: number | null;
  url: string | null;
  prev_position: number | null;
  checked_at: string;
}

type RankChecks = Record<string, RankCheck>;

async function loadChecks(): Promise<RankChecks> {
  const admin = createAdminClient();
  if (!admin) return {};
  const { data } = await admin.from("site_content").select("value").eq("key", "rank_checks").maybeSingle();
  return (data?.value as RankChecks) ?? {};
}

async function saveChecks(checks: RankChecks) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin
    .from("site_content")
    .upsert({ key: "rank_checks", value: checks, updated_at: new Date().toISOString() });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const action = String(body.action || "");

    if (action === "quota") return NextResponse.json(await getSerpQuota());

    if (action === "check" || action === "check-all") {
      if (!serpApiConfigured) return NextResponse.json({ error: "SerpApi not configured" }, { status: 503 });
      const keywords: string[] =
        action === "check" ? [String(body.keyword || "")] : (body.keywords ?? []).slice(0, 25);
      if (!keywords.length || keywords.some((k) => !k.trim())) {
        return NextResponse.json({ error: "Keyword required" }, { status: 400 });
      }

      const checks = await loadChecks();
      const now = new Date().toISOString();
      const results: RankChecks = {};
      for (const kw of keywords) {
        const { position, url } = await serpSearch(kw);
        const prev = checks[kw]?.position ?? null;
        checks[kw] = { position, url, prev_position: prev, checked_at: now };
        results[kw] = checks[kw];
      }
      await saveChecks(checks);
      return NextResponse.json({ ok: true, results, quota: await getSerpQuota() });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 500 });
  }
}
