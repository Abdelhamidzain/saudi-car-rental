/**
 * Bulk fetch of every active branch — used to seed the admin routing UI in a
 * single round-trip. Data set is small (10s of branches), so eager loading is
 * fine and keeps the client wiring trivial.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminBranchOption } from "./list-branches";

export async function listAllActiveBranches(): Promise<
  Array<AdminBranchOption & { company_id: string }>
> {
  const { data, error } = await getSupabaseAdminClient()
    .from("branches")
    .select(
      "id, company_id, district, address_ar, phone, whatsapp_number, is_main_branch, city:cities(id, slug, name_ar)",
    )
    .eq("status", "active")
    .order("is_main_branch", { ascending: false });

  if (error) {
    console.error("[listAllActiveBranches] failed", error);
    return [];
  }
  return (data ?? []) as unknown as Array<AdminBranchOption & { company_id: string }>;
}
