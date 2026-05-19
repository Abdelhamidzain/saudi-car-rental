/**
 * Slug → UUID resolvers for the lead-creation server action.
 *
 * Each function returns the id when the entity exists and is publicly usable
 * (active + published for customer-visible types), or null otherwise. The
 * server action treats a null result as a validation error mapped to a
 * user-facing Arabic message.
 *
 * All queries go through the service-role server client, so RLS is bypassed.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getCityIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("cities")
    .select("id")
    .eq("slug", slug)
    .eq("status", "active")
    .eq("public_status", "published")
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (error || !data) return null;
  return data.id;
}

export async function getCategoryIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("car_categories")
    .select("id")
    .eq("slug", slug)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (error || !data) return null;
  return data.id;
}

export async function getCarIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("cars")
    .select("id")
    .eq("slug", slug)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (error || !data) return null;
  return data.id;
}

export async function getAirportIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("airports")
    .select("id")
    .eq("slug", slug)
    .eq("status", "active")
    .eq("public_status", "published")
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (error || !data) return null;
  return data.id;
}
