import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { gscConfigured, gscInspectUrl } from "@/lib/google";

/** On-demand Search Console URL inspection for the Indexing Report. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!gscConfigured) return NextResponse.json({ error: "Search Console not configured" }, { status: 503 });

  try {
    const { url } = await req.json();
    if (typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    const result = await gscInspectUrl(url);
    if (!result) return NextResponse.json({ error: "Inspection failed" }, { status: 502 });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Inspection failed" }, { status: 500 });
  }
}
