/**
 * Admin cars list — for /admin/cars.
 *
 * Shows all statuses (no filter unless caller asks). Joined category for the
 * display label.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CarEntityStatus, CarTransmission } from "./validate";

export type AdminCarListRow = {
  id: string;
  brand: string;
  brand_ar: string;
  model: string;
  model_ar: string;
  slug: string;
  year: number | null;
  seats: number | null;
  transmission: CarTransmission | null;
  fuel_type: string | null;
  status: CarEntityStatus;
  created_at: string;
  updated_at: string;
  category: { id: string; slug: string; name_ar: string } | null;
};

export async function listCarsForAdmin(opts: {
  status?: CarEntityStatus | null;
} = {}): Promise<AdminCarListRow[]> {
  let q = getSupabaseAdminClient()
    .from("cars")
    .select(
      "id, brand, brand_ar, model, model_ar, slug, year, seats, transmission, fuel_type, status, created_at, updated_at, category:car_categories(id, slug, name_ar)",
    )
    .order("brand_ar", { ascending: true })
    .order("model_ar", { ascending: true });

  if (opts.status) q = q.eq("status", opts.status);

  const { data, error } = await q;
  if (error) {
    console.error("[listCarsForAdmin] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminCarListRow[];
}
