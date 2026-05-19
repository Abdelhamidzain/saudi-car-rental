/**
 * Admin branch picker — fetch active branches for a given company, optionally
 * filtered by the lead's city so the admin sees city-relevant branches first.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminBranchOption = {
  id: string;
  district: string | null;
  address_ar: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  is_main_branch: boolean;
  city: { id: string; slug: string; name_ar: string } | null;
};

export async function listBranchesForCompany(
  companyId: string,
): Promise<AdminBranchOption[]> {
  if (!companyId) return [];

  const { data, error } = await getSupabaseAdminClient()
    .from("branches")
    .select(
      "id, district, address_ar, phone, whatsapp_number, is_main_branch, city:cities(id, slug, name_ar)",
    )
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("is_main_branch", { ascending: false });

  if (error) {
    console.error("[listBranchesForCompany] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminBranchOption[];
}
