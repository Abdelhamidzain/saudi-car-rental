/**
 * Single-branch fetch for the admin edit page.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BranchEntityStatus } from "./validate";

export type AdminBranchDetail = {
  id: string;
  company_id: string;
  city_id: string;
  district: string | null;
  address_ar: string | null;
  address_en: string | null;
  google_maps_url: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  working_hours: unknown | null;
  is_main_branch: boolean;
  status: BranchEntityStatus;
  created_at: string;
  updated_at: string;
};

export async function getBranchById(id: string): Promise<AdminBranchDetail | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("branches")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AdminBranchDetail;
}
