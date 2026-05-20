/**
 * Public cities — visible to customers.
 *
 * Visibility: status='active' AND public_status='published'.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicCity } from "./types";

const CITY_PUBLIC_COLUMNS =
  "id, slug, name_ar, name_en, priority, display_order, min_price_from, seo_title_ar, seo_description_ar, seo_title_en, seo_description_en";

export async function getPublishedCities(): Promise<PublicCity[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("cities")
    .select(CITY_PUBLIC_COLUMNS)
    .eq("status", "active")
    .eq("public_status", "published")
    .order("priority", { ascending: true })
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[getPublishedCities] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicCity[];
}

export async function getPublishedCityBySlug(slug: string): Promise<PublicCity | null> {
  if (!slug) return null;
  const { data, error } = await getSupabaseAdminClient()
    .from("cities")
    .select(CITY_PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .eq("public_status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PublicCity;
}

/**
 * Resolves a city by UUID (used by adapters that hold a `city_id` foreign key,
 * such as the airport-page adapter resolving `airports.city_id`).
 */
export async function getPublishedCityById(id: string): Promise<PublicCity | null> {
  if (!id) return null;
  const { data, error } = await getSupabaseAdminClient()
    .from("cities")
    .select(CITY_PUBLIC_COLUMNS)
    .eq("id", id)
    .eq("status", "active")
    .eq("public_status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PublicCity;
}
