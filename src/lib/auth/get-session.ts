/**
 * Read the authenticated session and resolve the application-level role.
 *
 * Returns null when there is no signed-in user or the matching public.users
 * row is missing / disabled. The caller is responsible for redirecting.
 */

import "server-only";
import { getSupabaseAuthClient } from "@/lib/supabase/server-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminRole =
  | "owner"
  | "admin"
  | "editor"
  | "viewer"
  | "company_owner"
  | "branch_manager"
  | "sales_agent";

export type AdminUserStatus = "active" | "invited" | "disabled";

export type AdminSession = {
  user_id: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
};

export async function getSession(): Promise<AdminSession | null> {
  const authClient = await getSupabaseAuthClient();
  const { data: authData, error: authErr } = await authClient.auth.getUser();
  if (authErr || !authData.user) return null;

  // Role lookup uses the service-role client to bypass RLS — the auth
  // client itself can't read public.users until policies are enabled.
  const { data: profile, error: profErr } = await getSupabaseAdminClient()
    .from("users")
    .select("id, email, role, status")
    .eq("id", authData.user.id)
    .maybeSingle<{ id: string; email: string; role: AdminRole; status: AdminUserStatus }>();

  if (profErr || !profile) return null;
  if (profile.status === "disabled") return null;

  return {
    user_id: profile.id,
    email: profile.email,
    role: profile.role,
    status: profile.status,
  };
}
