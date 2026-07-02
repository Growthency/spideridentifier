import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only the authed areas need the Supabase session refresh + guards. Running
  // this on every public request wasted Worker CPU we can't spare, and public
  // pages read cookies directly in their server components anyway.
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/signup"],
};
