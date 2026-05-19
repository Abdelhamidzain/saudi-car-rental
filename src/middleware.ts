/**
 * Next.js middleware — gates /admin/* routes.
 *
 * Behaviour:
 *   - Refreshes the Supabase session cookies on every /admin/* request so
 *     the session stays alive across navigations.
 *   - Redirects unauthenticated requests to /admin/login (except the login
 *     page itself).
 *
 * Role checks are NOT done here — they live in server components and server
 * actions via `requireRole(...)`. Middleware can't safely query Postgres on
 * every request.
 */

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only act on /admin/* routes. Public site is unaffected.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({ request });
  }

  const { response, userId } = await updateSession(request);

  // Allow the login page through without a session.
  if (pathname === "/admin/login") {
    return response;
  }

  if (!userId) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("reason", "signin");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
