/**
 * Admin branches list for a single company. Shows ALL statuses (active +
 * inactive + archived) — admin needs to see retired branches too.
 *
 * Differs from src/lib/admin/routing/list-branches.ts which filters to
 * active branches for the routing picker.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BranchEntityStatus } from "./validate";

export type AdminBranchRow = {
  id: string;
  company_id: string;
  city_id: string;
  district: string | null;
  address_ar: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  is_main_branch: boolean;
  status: BranchEntityStatus;
  created_at: string;
  updated_at: string;
  city: { slug: string; name_ar: string } | null;
};

export async function listBranchesForCompanyForAdmin(
  companyId: string,
): Promise<AdminBranchRow[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("branches")
    .select(
      "id, company_id, city_id, district, address_ar, phone, whatsapp_number, is_main_branch, status, created_at, updated_at, city:cities(slug, name_ar)",
    )
    .eq("company_id", companyId)
    .order("is_main_branch", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listBranchesForCompanyForAdmin] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminBranchRow[];
}
