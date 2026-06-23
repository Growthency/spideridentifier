import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { serpApiConfigured, serpSearch, getSerpQuota } from "@/lib/serpapi";

export const maxDuration = 60;

export interface Keyword {
  id: number;
  keyword: string;
  position: number | null;
  prev_position: number | null;
  change: number | null;
  rank_url: string | null;
  volume: number | null;
  checked_at: string | null;
  created_at: string;
}

const KEY = "rank_keywords";

async function load(): Promise<Keyword[]> {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin.from("site_content").select("value").eq("key", KEY).maybeSingle();
  return Array.isArray(data?.value) ? (data.value as Keyword[]) : [];
}

async function save(list: Keyword[]) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("site_content").upsert({ key: KEY, value: list, updated_at: new Date().toISOString() });
}

/** Run one SerpApi lookup and return the position fields for a keyword. */
async function check(kw: Keyword): Promise<Pick<Keyword, "position" | "prev_position" | "change" | "rank_url" | "checked_at">> {
  const { position, url } = await serpSearch(kw.keyword);
  const prev = kw.position;
  const change = prev && position ? prev - position : null; // positive = improved
  return { position, prev_position: prev, change, rank_url: url, checked_at: new Date().toISOString() };
}

// ── GET: list keywords + pooled SerpApi quota ──
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [keywords, quota] = await Promise.all([load(), getSerpQuota()]);
  return NextResponse.json({ keywords, quota });
}

// ── POST: add / check / check_single / update_volume ──
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const action = String(body.action || "");
    const list = await load();

    if (action === "add") {
      const keyword = String(body.keyword || "").trim().toLowerCase();
      if (keyword.length < 2) return NextResponse.json({ error: "Keyword too short" }, { status: 400 });
      if (list.some((k) => k.keyword === keyword)) return NextResponse.json({ error: "Keyword already exists" }, { status: 409 });
      const item: Keyword = {
        id: Date.now(),
        keyword,
        position: null,
        prev_position: null,
        change: null,
        rank_url: null,
        volume: null,
        checked_at: null,
        created_at: new Date().toISOString(),
      };
      list.push(item);
      await save(list);
      return NextResponse.json({ keyword: item });
    }

    if (action === "update_volume") {
      const id = Number(body.id);
      const volume = body.volume == null ? null : Number(body.volume) || null;
      const k = list.find((x) => x.id === id);
      if (!k) return NextResponse.json({ error: "Not found" }, { status: 404 });
      k.volume = volume;
      await save(list);
      return NextResponse.json({ ok: true });
    }

    if (action === "check" || action === "check_single") {
      if (!serpApiConfigured) return NextResponse.json({ error: "SerpApi not configured" }, { status: 503 });
      const targets = action === "check_single" ? list.filter((k) => k.id === Number(body.id)) : list;
      if (!targets.length) return NextResponse.json({ error: "No keywords to check" }, { status: 400 });

      let single: Keyword | null = null;
      for (const kw of targets) {
        try {
          Object.assign(kw, await check(kw));
          single = kw;
        } catch (e) {
          if (action === "check_single") {
            return NextResponse.json({ error: e instanceof Error ? e.message : "Check failed" }, { status: 500 });
          }
        }
      }
      await save(list);
      if (action === "check_single" && single) {
        return NextResponse.json({ result: single });
      }
      return NextResponse.json({ ok: true, checked: targets.length, quota: await getSerpQuota() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 500 });
  }
}

// ── DELETE: remove a keyword by id ──
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const list = (await load()).filter((k) => k.id !== Number(id));
  await save(list);
  return NextResponse.json({ ok: true });
}
