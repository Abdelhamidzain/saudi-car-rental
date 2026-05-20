/**
 * Public cars — visible to customers.
 *
 * Visibility: status='active'. (No public_status column on cars.)
 * Joined to car_categories for display.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicCar } from "./types";

const CAR_PUBLIC_COLUMNS = [
  "id",
  "slug",
  "brand",
  "brand_ar",
  "model",
  "model_ar",
  "year",
  "seats",
  "transmission",
  "fuel_type",
  "image_url",
  "description_ar",
  "features_json",
  "category:car_categories(slug, name_ar, name_en, icon)",
].join(", ");

export async function getActiveCars(): Promise<PublicCar[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("cars")
    .select(CAR_PUBLIC_COLUMNS)
    .eq("status", "active")
    .order("brand_ar", { ascending: true })
    .order("model_ar", { ascending: true });
  if (error) {
    console.error("[getActiveCars] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicCar[];
}

export async function getActiveCarBySlug(slug: string): Promise<PublicCar | null> {
  if (!slug) return null;
  const { data, error } = await getSupabaseAdminClient()
    .from("cars")
    .select(CAR_PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PublicCar;
}

export async function getActiveCarsByCategorySlug(categorySlug: string): Promise<PublicCar[]> {
  if (!categorySlug) return [];

  // Resolve category slug → id; only active categories are reachable.
  const { data: cat } = await getSupabaseAdminClient()
    .from("car_categories")
    .select("id")
    .eq("slug", categorySlug)
    .eq("status", "active")
    .maybeSingle<{ id: string }>();
  if (!cat) return [];

  const { data, error } = await getSupabaseAdminClient()
    .from("cars")
    .select(CAR_PUBLIC_COLUMNS)
    .eq("category_id", cat.id)
    .eq("status", "active")
    .order("brand_ar", { ascending: true })
    .order("model_ar", { ascending: true });
  if (error) {
    console.error("[getActiveCarsByCategorySlug] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicCar[];
}
