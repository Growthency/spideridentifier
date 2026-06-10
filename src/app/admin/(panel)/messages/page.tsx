import { Inbox, Mail } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

async function getData() {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const [messages, subs] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_subscribers").select("email, created_at").order("created_at", { ascending: false }),
    ]);
    return {
      messages: (messages.data as Submission[]) ?? [],
      subscribers: (subs.data as { email: string; created_at: string }[]) ?? [],
    };
  } catch {
    return { messages: [], subscribers: [] };
  }
}

export default async function MessagesPage() {
  const data = await getData();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold">Messages</h1>
      <p className="mt-1 text-sm text-foreground/55">Contact submissions and newsletter subscribers.</p>

      {!data ? (
        <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-foreground/70">
          Configure Supabase to collect messages and subscribers.
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Inbox className="h-5 w-5 text-gold" /> Contact messages
            </h2>
            {data.messages.length === 0 ? (
              <p className="rounded-2xl border border-foreground/8 bg-card/50 p-8 text-center text-sm text-foreground/50">
                No messages yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data.messages.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-foreground/8 bg-card/50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{m.subject}</p>
                      <span className="text-xs text-foreground/45">{formatDate(m.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-[rgb(var(--gold-soft))]">
                      {m.name} ·{" "}
                      <a href={`mailto:${m.email}`} className="hover:underline">
                        {m.email}
                      </a>
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/70">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Mail className="h-5 w-5 text-gold" /> Subscribers
            </h2>
            <div className="rounded-2xl border border-foreground/8 bg-card/50 p-5">
              {data.subscribers.length === 0 ? (
                <p className="text-center text-sm text-foreground/50">No subscribers yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.subscribers.map((s) => (
                    <li key={s.email} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-foreground/80">{s.email}</span>
                      <span className="shrink-0 text-xs text-foreground/40">{formatDate(s.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
