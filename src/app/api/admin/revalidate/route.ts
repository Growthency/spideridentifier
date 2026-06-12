import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";

/** Admin "Clear Cache" — drops the ISR cache for the whole site. */
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
