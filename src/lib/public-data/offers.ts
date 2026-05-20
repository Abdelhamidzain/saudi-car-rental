/**
 * Public offers — visible to customers.
 *
 * Visibility (per Task 6.1 spec, all enforced in the WHERE clause):
 *   - offers.status='active'
 *   - offers.public_status='published'
 *   - offers.approval_status IN ('approved','auto_approved')
 *   - offers.availability_status != 'unavailable'
 *   - company.status='active'
 *   - company.public_status='published'
 *   - company.trust_level != 'blocked'
 *   - branch.status='active'
 *   - car.status='active'
 *
 * Parent-status filtering is done by pre-resolving the valid company/branch/
 * car id sets and using `.in('field', ids)` on the offers query. This is more
 * predictable than PostgREST nested filters and works without `!inner` magic.
 *
 * The `branch` object intentionally OMITS `whatsapp_number` — public surface
 * does not expose direct partner WhatsApp; routing happens admin-side.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicOffer } from "./types";

const OFFER_PUBLIC_COLUMNS = [
  "id",
  "daily_price_from",
  "weekly_price_from",
  "monthly_price_from",
  "deposit_amount",
  "insurance_included",
  "insurance_type",
  "mileage_limit",
  "delivery_available",
  "airport_delivery_available",
  "price_status",
  "availability_status",
  "last_updated_at",
  // Join shapes — note no whatsapp_number on branch.
  "company:companies(slug, name_ar, name_en, logo_url, rating_snapshot)",
  "branch:branches(id, district, address_ar)",
  "car:cars(slug, brand_ar, model_ar, year, image_url)",
  "city:cities(slug, name_ar)",
  "airport:airports(slug, name_ar, code)",
].join(", ");

const APPROVED_STATUSES = ["approved", "auto_approved"];

/**
 * Resolve the sets of valid parent-table ids to use as IN-list filters on
 * the offers query. Returns empty sets if no eligible parents exist.
 */
async function loadValidParentIds(): Promise<{
  companyIds: string[];
  branchIds: string[];
  carIds: string[];
}> {
  const supabase = getSupabaseAdminClient();

  const [companiesRes, branchesRes, carsRes] = await Promise.all([
    supabase
      .from("companies")
      .select("id")
      .eq("status", "active")
      .eq("public_status", "published")
      .neq("trust_level", "blocked"),
    supabase.from("branches").select("id").eq("status", "active"),
    supabase.from("cars").select("id").eq("status", "active"),
  ]);

  return {
    companyIds: (companiesRes.data ?? []).map(r => (r as { id: string }).id),
    branchIds: (branchesRes.data ?? []).map(r => (r as { id: string }).id),
    carIds: (carsRes.data ?? []).map(r => (r as { id: string }).id),
  };
}

export async function getPublicOfferById(id: string): Promise<PublicOffer | null> {
  if (!id) return null;
  const { companyIds, branchIds, carIds } = await loadValidParentIds();
  if (companyIds.length === 0 || branchIds.length === 0 || carIds.length === 0) return null;

  const { data, error } = await getSupabaseAdminClient()
    .from("offers")
    .select(OFFER_PUBLIC_COLUMNS)
    .eq("id", id)
    .eq("status", "active")
    .eq("public_status", "published")
    .in("approval_status", APPROVED_STATUSES)
    .neq("availability_status", "unavailable")
    .in("company_id", companyIds)
    .in("branch_id", branchIds)
    .in("car_id", carIds)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PublicOffer;
}

export async function getPublicOffersByCitySlug(citySlug: string): Promise<PublicOffer[]> {
  if (!citySlug) return [];
  const supabase = getSupabaseAdminClient();

  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", citySlug)
    .eq("status", "active")
    .eq("public_status", "published")
    .maybeSingle<{ id: string }>();
  if (!city) return [];

  const { companyIds, branchIds, carIds } = await loadValidParentIds();
  if (companyIds.length === 0 || branchIds.length === 0 || carIds.length === 0) return [];

  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_PUBLIC_COLUMNS)
    .eq("city_id", city.id)
    .eq("status", "active")
    .eq("public_status", "published")
    .in("approval_status", APPROVED_STATUSES)
    .neq("availability_status", "unavailable")
    .in("company_id", companyIds)
    .in("branch_id", branchIds)
    .in("car_id", carIds)
    .order("daily_price_from", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[getPublicOffersByCitySlug] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicOffer[];
}

export async function getPublicOffersByCarSlug(carSlug: string): Promise<PublicOffer[]> {
  if (!carSlug) return [];
  const supabase = getSupabaseAdminClient();

  const { data: car } = await supabase
    .from("cars")
    .select("id")
    .eq("slug", carSlug)
    .eq("status", "active")
    .maybeSingle<{ id: string }>();
  if (!car) return [];

  const { companyIds, branchIds } = await loadValidParentIds();
  if (companyIds.length === 0 || branchIds.length === 0) return [];

  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_PUBLIC_COLUMNS)
    .eq("car_id", car.id)
    .eq("status", "active")
    .eq("public_status", "published")
    .in("approval_status", APPROVED_STATUSES)
    .neq("availability_status", "unavailable")
    .in("company_id", companyIds)
    .in("branch_id", branchIds)
    .order("daily_price_from", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[getPublicOffersByCarSlug] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicOffer[];
}
