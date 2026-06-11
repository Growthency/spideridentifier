import { Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

async function getUsers(): Promise<Profile[] | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    return (data as Profile[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AdminUsers() {
  const users = await getUsers();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold">Users</h1>
      <p className="mt-1 text-sm text-foreground/55">Everyone who has created an account.</p>

      {users === null ? (
        <p className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-foreground/70">
          Configure Supabase to view registered users.
        </p>
      ) : users.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-3xl border border-foreground/8 bg-card/50 p-16 text-center">
          <Users className="h-10 w-10 text-foreground/30" />
          <p className="mt-4 font-medium">No users yet</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-foreground/8">
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.02] text-left text-xs uppercase tracking-wide text-foreground/45">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="hidden p-4 font-medium sm:table-cell">Plan</th>
                <th className="p-4 font-medium">Credits</th>
                <th className="hidden p-4 font-medium md:table-cell">Scans</th>
                <th className="hidden p-4 font-medium lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-foreground/8">
                  <td className="max-w-xs p-4">
                    <p className="truncate font-medium">{u.full_name || "—"}</p>
                    <p className="truncate text-xs text-foreground/50">{u.email}</p>
                  </td>
                  <td className="hidden p-4 sm:table-cell">
                    <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium capitalize text-gold">{u.plan}</span>
                  </td>
                  <td className="p-4 text-foreground/70">{u.credits.toLocaleString("en-US")}</td>
                  <td className="hidden p-4 text-foreground/60 md:table-cell">{u.total_identifications}</td>
                  <td className="hidden p-4 text-foreground/50 lg:table-cell">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
