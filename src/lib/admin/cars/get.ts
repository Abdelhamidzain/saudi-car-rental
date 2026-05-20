/**
 * Single-car fetch for the admin edit page. Preserves features_json in the
 * returned shape so the page can display "JSON not editable in this UI"
 * informational text if the value is non-trivial.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CarEntityStatus, CarTransmission } from "./validate";

export type AdminCarDetail = {
  id: string;
  brand: string;
  brand_ar: string;
  model: string;
  model_ar: string;
  slug: string;
  year: number | null;
  category_id: string;
  seats: number | null;
  transmission: CarTransmission | null;
  fuel_type: string | null;
  features_json: unknown | null;
  image_url: string | null;
  description_ar: string | null;
  status: CarEntityStatus;
  created_at: string;
  updated_at: string;
  category: { id: string; slug: string; name_ar: string } | null;
};

export async function getCarById(id: string): Promise<AdminCarDetail | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("cars")
    .select("*, category:car_categories(id, slug, name_ar)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AdminCarDetail;
}
