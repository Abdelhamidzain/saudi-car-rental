/**
 * Returns ALL branches (any status) joined with their company + city.
 *
 * Distinct from src/lib/admin/branches/list-for-company.ts (admin per-company
 * view) and src/lib/admin/routing/list-all-branches.ts (active-only for the
 * routing picker). The offer form needs to show inactive/archived branches
 * so legacy offers can still be edited; the picker labels mark non-active
 * branches with a status suffix.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BranchEntityStatus } from "./validate";

export type AdminAllBranchRow = {
  id: string;
  company_id: string;
  city_id: string;
  district: string | null;
  address_ar: string | null;
  whatsapp_number: string | null;
  is_main_branch: boolean;
  status: BranchEntityStatus;
  company: { id: string; name_ar: string; status: string } | null;
  city: { id: string; slug: string; name_ar: string } | null;
};

export async function listAllBranchesForAdmin(): Promise<AdminAllBranchRow[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("branches")
    .select(
      "id, company_id, city_id, district, address_ar, whatsapp_number, is_main_branch, status, company:companies(id, name_ar, status), city:cities(id, slug, name_ar)",
    )
    .order("is_main_branch", { ascending: false });

  if (error) {
    console.error("[listAllBranchesForAdmin] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminAllBranchRow[];
}
