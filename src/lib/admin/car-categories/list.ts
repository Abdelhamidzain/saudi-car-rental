/**
 * Active car-category options for the car form's category picker.
 *
 * Mirrors src/lib/admin/cities/list.ts. No category CRUD UI exists yet —
 * admin uses these as a closed set sourced from the seed.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminCarCategoryOption = {
  id: string;
  slug: string;
  name_ar: string;
};

export async function listActiveCarCategories(): Promise<AdminCarCategoryOption[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("car_categories")
    .select("id, slug, name_ar")
    .eq("status", "active")
    .order("name_ar", { ascending: true });
  if (error) {
    console.error("[listActiveCarCategories] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminCarCategoryOption[];
}
