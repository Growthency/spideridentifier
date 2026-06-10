import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().min(1).max(160),
  message: z.string().min(1).max(5000),
});

async function notify(data: z.infer<typeof schema>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Spider Identifier <onboarding@resend.dev>",
        to,
        subject: `New contact: ${data.subject}`,
        text: `From ${data.name} <${data.email}>\n\n${data.message}`,
      }),
    });
  } catch {
    // notification is best-effort
  }
}

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    if (!adminConfigured) {
      // Demo mode — accept gracefully.
      return NextResponse.json({ ok: true, stored: false });
    }

    const supabase = createAdminClient()!;
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    if (error) throw error;

    await notify(parsed.data);
    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}
