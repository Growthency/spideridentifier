import { NextResponse } from "next/server";
import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWANCE: Record<string, number> = { starter: 120, explorer: 550, pro: 1200 };

/** Paddle webhook — subscription lifecycle + credit refresh on payment. */
export async function POST(req: Request) {
  const apiKey = process.env.PADDLE_API_KEY;
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!apiKey || !secret || !adminConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const paddle = new Paddle(apiKey, {
    environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" ? Environment.sandbox : Environment.production,
  });

  const signature = req.headers.get("paddle-signature") || "";
  const body = await req.text();

  let event;
  try {
    event = await paddle.webhooks.unmarshal(body, secret, signature);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }
  if (!event) return NextResponse.json({ ok: true });

  const admin = createAdminClient()!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = event.data as any;
  const custom = data?.customData || {};
  const userId: string | undefined = custom.userId;
  const plan: string = (custom.plan || "").toLowerCase();

  try {
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated: {
        if (userId) {
          await admin
            .from("profiles")
            .update({
              subscription_id: data.id,
              subscription_status: data.status,
              plan: plan || undefined,
              paddle_customer_id: data.customerId,
              current_period_end: data.currentBillingPeriod?.endsAt ?? null,
            })
            .eq("id", userId);
          // Trial: grant 30% of the monthly allowance up-front
          if (event.eventType === EventName.SubscriptionCreated && data.status === "trialing" && ALLOWANCE[plan]) {
            await admin.from("profiles").update({ credits: Math.round(ALLOWANCE[plan] * 0.3) }).eq("id", userId);
          }
        }
        break;
      }
      case EventName.SubscriptionCanceled: {
        if (userId) {
          await admin
            .from("profiles")
            .update({ subscription_status: "canceled", subscription_canceled_at: new Date().toISOString() })
            .eq("id", userId);
        }
        break;
      }
      case EventName.TransactionCompleted: {
        const txId = data.id as string;
        const { data: existing } = await admin
          .from("transactions")
          .select("id")
          .eq("paddle_transaction_id", txId)
          .maybeSingle();
        if (!existing && userId && ALLOWANCE[plan]) {
          // refresh credits to full monthly allowance (don't stack)
          await admin.from("profiles").update({ credits: ALLOWANCE[plan], plan, subscription_status: "active" }).eq("id", userId);
          await admin.from("transactions").insert({
            user_id: userId,
            paddle_transaction_id: txId,
            paddle_subscription_id: data.subscriptionId ?? null,
            credits_added: ALLOWANCE[plan],
            amount_paid: Number(data.details?.totals?.total ?? 0) / 100,
            pack_name: plan,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
