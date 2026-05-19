/**
 * Admin company picker — fetch active+published companies for the assign UI.
 * Service-role read; caller must have enforced role first.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminCompanyOption = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
};

export async function listCompaniesForAssignment(): Promise<AdminCompanyOption[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("companies")
    .select("id, name_ar, name_en, slug")
    .eq("status", "active")
    .order("name_ar", { ascending: true });

  if (error) {
    console.error("[listCompaniesForAssignment] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminCompanyOption[];
}
