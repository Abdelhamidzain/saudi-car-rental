/**
 * Single-company fetch with every column the admin form needs to pre-fill.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  EntityStatus,
  PublicStatus,
  TrustLevel,
} from "./validate";

export type AdminCompanyDetail = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  google_maps_url: string | null;
  rating_snapshot: number | null;
  reviews_count_snapshot: number | null;
  rating_snapshot_verified_at: string | null;
  trust_level: TrustLevel;
  public_status: PublicStatus;
  internal_notes: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
};

export async function getCompanyById(id: string): Promise<AdminCompanyDetail | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("companies")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AdminCompanyDetail;
}
