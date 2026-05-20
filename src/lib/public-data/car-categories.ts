/**
 * Public car categories — visible to customers.
 *
 * Visibility: status='active'. (No public_status column on car_categories.)
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicCarCategory } from "./types";

const CATEGORY_PUBLIC_COLUMNS = "id, slug, name_ar, name_en, icon, sort_order";

export async function getActiveCarCategories(): Promise<PublicCarCategory[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("car_categories")
    .select(CATEGORY_PUBLIC_COLUMNS)
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[getActiveCarCategories] failed", error);
    return [];
  }
  return (data ?? []) as unknown as PublicCarCategory[];
}

export async function getActiveCarCategoryBySlug(slug: string): Promise<PublicCarCategory | null> {
  if (!slug) return null;
  const { data, error } = await getSupabaseAdminClient()
    .from("car_categories")
    .select(CATEGORY_PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PublicCarCategory;
}
