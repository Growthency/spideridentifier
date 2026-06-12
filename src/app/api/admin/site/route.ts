import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * One admin endpoint for all site-config writes.
 * Body: { action, ...payload } — guarded by the admin allow-list.
 *
 *   set_content     { key, value }
 *   save_script     { script }            upsert one site_scripts row
 *   delete_script   { id }
 *   save_menu_item  { item }              upsert one menu_items row
 *   delete_menu_item{ id }
 *   save_link_rule  { rule }              upsert one external_link_rules row
 *   delete_link_rule{ id }
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  try {
    const body = await req.json();
    const action = String(body.action || "");

    if (action === "set_content") {
      const key = String(body.key || "").slice(0, 80);
      if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });
      const { error } = await admin
        .from("site_content")
        .upsert({ key, value: body.value ?? {}, updated_at: new Date().toISOString() });
      if (error) throw error;
    } else if (action === "save_script") {
      const s = body.script ?? {};
      const row = {
        ...(s.id ? { id: s.id } : {}),
        label: String(s.label || "Untitled").slice(0, 120),
        location: s.location === "body" ? "body" : "head",
        code: String(s.code || ""),
        enabled: Boolean(s.enabled),
        sort_order: Number(s.sort_order) || 0,
      };
      const { error } = await admin.from("site_scripts").upsert(row);
      if (error) throw error;
    } else if (action === "delete_script") {
      const { error } = await admin.from("site_scripts").delete().eq("id", body.id);
      if (error) throw error;
    } else if (action === "save_menu_item") {
      const m = body.item ?? {};
      const row = {
        ...(m.id ? { id: m.id } : {}),
        menu: m.menu,
        label: String(m.label || "").slice(0, 80),
        url: String(m.url || "/").slice(0, 300),
        target: m.target === "_blank" ? "_blank" : "_self",
        sort_order: Number(m.sort_order) || 0,
        enabled: m.enabled !== false,
      };
      if (!row.label || !["header", "footer_explore", "footer_company", "footer_bottom"].includes(row.menu)) {
        return NextResponse.json({ error: "Invalid menu item" }, { status: 400 });
      }
      const { error } = await admin.from("menu_items").upsert(row);
      if (error) throw error;
    } else if (action === "delete_menu_item") {
      const { error } = await admin.from("menu_items").delete().eq("id", body.id);
      if (error) throw error;
    } else if (action === "save_link_rule") {
      const r = body.rule ?? {};
      const domain = String(r.domain || "")
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "")
        .trim();
      if (!domain) return NextResponse.json({ error: "Domain required" }, { status: 400 });
      const row = {
        ...(r.id ? { id: r.id } : {}),
        domain,
        nofollow: r.nofollow !== false,
        sponsored: Boolean(r.sponsored),
      };
      const { error } = await admin.from("external_link_rules").upsert(row, { onConflict: "domain" });
      if (error) throw error;
    } else if (action === "delete_link_rule") {
      const { error } = await admin.from("external_link_rules").delete().eq("id", body.id);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Site config affects every page — refresh the public layout.
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Supabase errors are plain objects, not Error instances — dig the
    // message out either way so the admin sees the real reason.
    const raw =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Save failed";
    const friendly = /schema cache|does not exist/i.test(raw)
      ? "Database table missing — run supabase/admin-schema.sql in the Supabase SQL Editor once, then save again."
      : raw;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
