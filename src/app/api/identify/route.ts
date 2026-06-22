import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { imageExt } from "@/lib/webp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { uploadToBucket } from "@/lib/storageUpload";
import { CREDITS_PER_SCAN, GUEST_FREE_SCANS } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const PROMPT = `You are an expert arachnologist. Identify the spider in this photo.
Respond with ONLY valid minified JSON (no markdown, no commentary) in EXACTLY this shape:
{"commonName":string,"scientificName":string,"family":string,"venomLevel":"harmless"|"mild"|"caution"|"dangerous","confidence":"High"|"Medium"|"Low","summary":string,"identification":string[],"habitat":string,"region":string,"lookAlikes":string[],"recommendedAction":string,"funFact":string}
Rules:
- "summary" is 1-2 sentences. "identification" is 3-5 short visual identifiers.
- "lookAlikes" lists 0-3 commonly confused species (may be empty).
- Flag medically significant spiders (widows, recluses, wandering spiders, etc.) as "dangerous".
- If the image is clearly NOT a spider, set commonName to "Not a spider", confidence "Low".
- Never guarantee safety. For any "dangerous" flag, advise keeping distance and seeking medical help for bites.`;

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip")) || "0.0.0.0";
}

function parseResult(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const json = JSON.parse(cleaned.slice(start, end + 1));
  const levels = ["harmless", "mild", "caution", "dangerous"];
  if (!levels.includes(json.venomLevel)) json.venomLevel = "caution";
  return json;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !adminConfigured) {
    // Not configured — tell the client to use the local demo experience.
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  // who is identifying?
  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const admin = createAdminClient()!;

  let plan = "free";
  let credits = 0;
  if (user) {
    const { data: profile } = await admin.from("profiles").select("plan, credits").eq("id", user.id).maybeSingle();
    plan = profile?.plan ?? "free";
    credits = profile?.credits ?? 0;
    if (credits < CREDITS_PER_SCAN) {
      return NextResponse.json({ error: "no_credits" }, { status: 402 });
    }
  } else {
    // guest rate limit by IP per day
    const ip = clientIp(req);
    const today = new Date().toISOString().slice(0, 10);
    const { data: usage } = await admin.from("ip_usage").select("count, reset_date").eq("ip_address", ip).maybeSingle();
    const used = usage && usage.reset_date === today ? usage.count : 0;
    if (used >= GUEST_FREE_SCANS) {
      return NextResponse.json({ error: "guest_limit" }, { status: 402 });
    }
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "no_image" }, { status: 400 });
    }
    const data = Buffer.from(await file.arrayBuffer());
    // Claude vision accepts jpeg/png/gif/webp directly; fall back to jpeg.
    const supported = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const mediaType = supported.includes(file.type) ? file.type : "image/jpeg";

    // AI vision model call
    const anthropic = new Anthropic({ apiKey });
    const model = plan === "free" ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6";
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg", data: data.toString("base64") } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });
    const block = msg.content.find((c) => c.type === "text");
    const text = block && block.type === "text" ? block.text : "";
    const result = parseResult(text);

    // store image + analysis (identification still succeeds if storage is down)
    let imageUrl: string | null = null;
    try {
      const path = `uploads/${crypto.randomUUID()}.${imageExt(mediaType)}`;
      imageUrl = await uploadToBucket(admin, "scans", path, data, { contentType: mediaType, upsert: false });
    } catch {
      imageUrl = null;
    }

    await admin.from("analyses").insert({
      user_id: user?.id ?? null,
      ip_address: user ? null : clientIp(req),
      image_url: imageUrl,
      image_urls: imageUrl ? [imageUrl] : [],
      result,
      credits_used: user ? CREDITS_PER_SCAN : 0,
    });

    let creditsLeft: number | null = null;
    if (user) {
      creditsLeft = credits - CREDITS_PER_SCAN;
      const { data: p } = await admin
        .from("profiles")
        .select("total_identifications")
        .eq("id", user.id)
        .maybeSingle();
      await admin
        .from("profiles")
        .update({ credits: creditsLeft, total_identifications: (p?.total_identifications ?? 0) + 1 })
        .eq("id", user.id);
    } else {
      const ip = clientIp(req);
      const today = new Date().toISOString().slice(0, 10);
      const { data: usage } = await admin.from("ip_usage").select("count, reset_date").eq("ip_address", ip).maybeSingle();
      const used = usage && usage.reset_date === today ? usage.count : 0;
      await admin.from("ip_usage").upsert({ ip_address: ip, count: used + 1, reset_date: today });
    }

    return NextResponse.json({ result, imageUrl, creditsLeft, guest: !user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Identification failed";
    return NextResponse.json({ error: "failed", message }, { status: 500 });
  }
}
