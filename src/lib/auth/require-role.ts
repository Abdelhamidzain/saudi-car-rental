/**
 * Server-side role gate.
 *
 * Call at the top of any admin server component or server action that needs
 * authenticated access. Redirects (or throws) when the caller is missing
 * the required role.
 */

import "server-only";
import { redirect } from "next/navigation";
import { getSession, type AdminRole, type AdminSession } from "./get-session";

/**
 * Redirect-on-fail variant — for server components rendering admin pages.
 * Returns the session when allowed; throws a Next.js redirect otherwise.
 */
export async function requireRole(allowed: AdminRole[]): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?reason=signin");
  }
  if (!allowed.includes(session.role)) {
    redirect("/admin/login?reason=forbidden");
  }
  return session;
}

/**
 * Assertion variant — for server actions. Does NOT redirect. Returns
 * { ok: false } when the caller lacks the role so the action can return a
 * structured error to the client.
 */
export async function assertRole(
  allowed: AdminRole[],
): Promise<{ ok: true; session: AdminSession } | { ok: false; reason: "signin" | "forbidden" }> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "signin" };
  if (!allowed.includes(session.role)) return { ok: false, reason: "forbidden" };
  return { ok: true, session };
}
