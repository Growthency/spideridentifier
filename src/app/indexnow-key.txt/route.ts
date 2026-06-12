import { getSiteContent } from "@/lib/siteContent";

/**
 * IndexNow key file. The admin Indexing Report generates the key on first
 * submission and stores it in site_content; submissions reference this
 * location via the keyLocation field.
 */
export async function GET() {
  const key = await getSiteContent<string>("indexnow_key", "");
  if (!key) return new Response("Not configured", { status: 404 });
  return new Response(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
