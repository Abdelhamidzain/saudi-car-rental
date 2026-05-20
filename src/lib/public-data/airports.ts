/**
 * Public airports — visible to customers.
 *
 * Visibility: status='active' AND public_status='published'.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicAirport } from "./types";

const AIRPORT_PUBLIC_COLUMNS =
  "id, code, slug, city_id, name_ar, name_en, priority, display_order, min_price_from, seo_title_ar, seo_description_ar, seo_title_en, seo_description_en";

export async function getPublishedAirports(): Promise<PublicAirport[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("airports")
    .select(AIRPORT_PUBLIC_COLUMNS)
    .eq("status", "active")
    .eq("public_status", "published")
    .order("priority", { ascending: true })
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[getPublishedAirports] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicAirport[];
}

export async function getPublishedAirportBySlug(slug: string): Promise<PublicAirport | null> {
  if (!slug) return null;
  const { data, error } = await getSupabaseAdminClient()
    .from("airports")
    .select(AIRPORT_PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .eq("public_status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PublicAirport;
}

export async function getPublishedAirportsForCitySlug(citySlug: string): Promise<PublicAirport[]> {
  if (!citySlug) return [];

  // First resolve city slug → id (returns null if city itself isn't public).
  const { data: cityRow } = await getSupabaseAdminClient()
    .from("cities")
    .select("id")
    .eq("slug", citySlug)
    .eq("status", "active")
    .eq("public_status", "published")
    .maybeSingle<{ id: string }>();
  if (!cityRow) return [];

  const { data, error } = await getSupabaseAdminClient()
    .from("airports")
    .select(AIRPORT_PUBLIC_COLUMNS)
    .eq("city_id", cityRow.id)
    .eq("status", "active")
    .eq("public_status", "published")
    .order("priority", { ascending: true });
  if (error) {
    console.error("[getPublishedAirportsForCitySlug] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicAirport[];
}
