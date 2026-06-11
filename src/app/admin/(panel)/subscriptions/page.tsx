import { DollarSign, Users, TrendingUp, Receipt } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

interface Tx {
  id: string;
  user_id: string;
  amount_paid: number;
  pack_name: string;
  created_at: string;
}
interface Prof {
  plan: string;
  subscription_status: string | null;
}

async function getData() {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const [{ data: txs }, { data: profs }] = await Promise.all([
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("plan, subscription_status"),
    ]);
    return { txs: (txs as Tx[]) ?? [], profs: (profs as Prof[]) ?? [] };
  } catch {
    return { txs: [], profs: [] };
  }
}

export default async function AdminSubscriptions() {
  const data = await getData();

  const txs = data?.txs ?? [];
  const profs = data?.profs ?? [];
  const revenue = txs.reduce((s, t) => s + (Number(t.amount_paid) || 0), 0);
  const thisMonth = txs
    .filter((t) => new Date(t.created_at).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + (Number(t.amount_paid) || 0), 0);
  const active = profs.filter((p) => p.subscription_status === "active" || p.subscription_status === "trialing");
  const byPlan = (plan: string) => active.filter((p) => p.plan === plan).length;

  const stats = [
    { label: "Total revenue", value: `$${revenue.toFixed(2)}`, icon: DollarSign },
    { label: "This month", value: `$${thisMonth.toFixed(2)}`, icon: TrendingUp },
    { label: "Active subscribers", value: active.length, icon: Users },
    { label: "Transactions", value: txs.length, icon: Receipt },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold">Subscriptions</h1>
      <p className="mt-1 text-sm text-foreground/55">Revenue, active plans and recent transactions.</p>

      {!data && (
        <p className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-foreground/70">
          Configure Supabase + Paddle to see live billing data.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-foreground/8 bg-card/50 p-6">
            <s.icon className="h-6 w-6 text-gold" />
            <p className="mt-4 font-display text-3xl font-extrabold">{s.value}</p>
            <p className="mt-1 text-sm text-foreground/55">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {(["starter", "explorer", "pro"] as const).map((plan) => (
          <div key={plan} className="rounded-2xl border border-foreground/8 bg-card/50 p-5">
            <p className="text-sm capitalize text-foreground/55">{plan}</p>
            <p className="mt-1 font-display text-2xl font-bold">{byPlan(plan)}</p>
            <p className="text-xs text-foreground/45">active subscribers</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-8 font-display text-lg font-bold">Recent transactions</h2>
      {txs.length === 0 ? (
        <p className="rounded-2xl border border-foreground/8 bg-card/50 p-8 text-center text-sm text-foreground/50">
          No transactions yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-foreground/8">
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.02] text-left text-xs uppercase tracking-wide text-foreground/45">
              <tr>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="hidden p-4 font-medium sm:table-cell">Credits</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-foreground/8">
                  <td className="p-4 font-medium capitalize">{t.pack_name}</td>
                  <td className="p-4 text-foreground/70">${Number(t.amount_paid).toFixed(2)}</td>
                  <td className="hidden p-4 text-foreground/60 sm:table-cell">—</td>
                  <td className="p-4 text-foreground/50">{formatDate(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
