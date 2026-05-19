/**
 * Active cities for admin dropdowns (branch form's city picker).
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminCityOption = {
  id: string;
  slug: string;
  name_ar: string;
};

export async function listActiveCities(): Promise<AdminCityOption[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("cities")
    .select("id, slug, name_ar")
    .eq("status", "active")
    .order("name_ar", { ascending: true });
  if (error) {
    console.error("[listActiveCities] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminCityOption[];
}
