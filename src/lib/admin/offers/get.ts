/**
 * Single-offer fetch for the admin edit page. Returns the full row plus
 * joined refs so the form can pre-fill every field.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ApprovalStatus,
  AvailabilityStatus,
  OfferEntityStatus,
  OfferPublicStatus,
  PriceStatus,
} from "./validate";

export type AdminOfferDetail = {
  id: string;
  company_id: string;
  branch_id: string;
  car_id: string;
  city_id: string;
  airport_id: string | null;
  daily_price_from: number | null;
  weekly_price_from: number | null;
  monthly_price_from: number | null;
  deposit_amount: number | null;
  insurance_included: boolean | null;
  insurance_type: string | null;
  mileage_limit: number | null;
  delivery_available: boolean;
  airport_delivery_available: boolean;
  price_status: PriceStatus;
  availability_status: AvailabilityStatus;
  approval_status: ApprovalStatus;
  public_status: OfferPublicStatus;
  status: OfferEntityStatus;
  last_updated_at: string | null;
  created_at: string;
  updated_at: string;
  company: { id: string; name_ar: string; status: string } | null;
  branch: { id: string; district: string | null; address_ar: string | null; status: string } | null;
  car: { id: string; brand_ar: string; model_ar: string; year: number | null; status: string } | null;
  city: { id: string; slug: string; name_ar: string } | null;
  airport: { id: string; name_ar: string; code: string } | null;
};

export async function getOfferById(id: string): Promise<AdminOfferDetail | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("offers")
    .select(
      [
        "*",
        "company:companies(id, name_ar, status)",
        "branch:branches(id, district, address_ar, status)",
        "car:cars(id, brand_ar, model_ar, year, status)",
        "city:cities(id, slug, name_ar)",
        "airport:airports(id, name_ar, code)",
      ].join(", "),
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AdminOfferDetail;
}
