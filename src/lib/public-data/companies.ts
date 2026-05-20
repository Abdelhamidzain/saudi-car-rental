/**
 * Public companies — visible to customers.
 *
 * Visibility:
 *   - status='active'
 *   - public_status='published'
 *   - trust_level != 'blocked'
 *
 * The SELECT list intentionally OMITS internal_notes, trust_level, status,
 * and public_status — these are admin-internal moderation signals.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicCompany } from "./types";

const COMPANY_PUBLIC_COLUMNS =
  "id, slug, name_ar, name_en, logo_url, website_url, google_maps_url, rating_snapshot, reviews_count_snapshot";

export async function getPublicCompanies(): Promise<PublicCompany[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("companies")
    .select(COMPANY_PUBLIC_COLUMNS)
    .eq("status", "active")
    .eq("public_status", "published")
    .neq("trust_level", "blocked")
    .order("name_ar", { ascending: true });
  if (error) {
    console.error("[getPublicCompanies] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicCompany[];
}

export async function getPublicCompanyBySlug(slug: string): Promise<PublicCompany | null> {
  if (!slug) return null;
  const { data, error } = await getSupabaseAdminClient()
    .from("companies")
    .select(COMPANY_PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .eq("public_status", "published")
    .neq("trust_level", "blocked")
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PublicCompany;
}

/**
 * Companies that have at least one active branch in the given (published) city.
 * Resolves city slug to id first, then queries branches → distinct companies.
 */
export async function getPublicCompaniesByCitySlug(citySlug: string): Promise<PublicCompany[]> {
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

  // Distinct company ids that have at least one active branch in this city.
  const { data: branchRows } = await supabase
    .from("branches")
    .select("company_id")
    .eq("city_id", city.id)
    .eq("status", "active");
  const companyIds = Array.from(new Set((branchRows ?? []).map(r => (r as { company_id: string }).company_id)));
  if (companyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_PUBLIC_COLUMNS)
    .in("id", companyIds)
    .eq("status", "active")
    .eq("public_status", "published")
    .neq("trust_level", "blocked")
    .order("name_ar", { ascending: true });
  if (error) {
    console.error("[getPublicCompaniesByCitySlug] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicCompany[];
}
