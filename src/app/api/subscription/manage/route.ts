import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";

/**
 * Returns the Paddle customer-portal URL so a user can manage their plan,
 * payment method or cancel. Requires Paddle to be configured.
 */
export async function POST() {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!profile.paddle_customer_id) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });

  try {
    const { Paddle, Environment } = await import("@paddle/paddle-node-sdk");
    const paddle = new Paddle(apiKey, {
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" ? Environment.sandbox : Environment.production,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await (paddle as any).customerPortalSessions.create(profile.paddle_customer_id, []);
    return NextResponse.json({ url: session?.urls?.general?.overview ?? null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
