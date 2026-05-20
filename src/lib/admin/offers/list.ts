/**
 * Admin offers list — joins to company / branch / car / city for display.
 * Ordered by last_updated_at desc (nulls last).
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

export type AdminOfferListRow = {
  id: string;
  daily_price_from: number | null;
  weekly_price_from: number | null;
  monthly_price_from: number | null;
  price_status: PriceStatus;
  availability_status: AvailabilityStatus;
  approval_status: ApprovalStatus;
  public_status: OfferPublicStatus;
  status: OfferEntityStatus;
  last_updated_at: string | null;
  created_at: string;
  updated_at: string;
  company: { id: string; name_ar: string } | null;
  branch: { id: string; district: string | null; address_ar: string | null } | null;
  car: { id: string; brand_ar: string; model_ar: string; year: number | null } | null;
  city: { id: string; slug: string; name_ar: string } | null;
};

export async function listOffersForAdmin(opts: {
  approval_status?: ApprovalStatus | null;
  public_status?: OfferPublicStatus | null;
  company_id?: string | null;
} = {}): Promise<AdminOfferListRow[]> {
  let q = getSupabaseAdminClient()
    .from("offers")
    .select(
      [
        "id",
        "daily_price_from",
        "weekly_price_from",
        "monthly_price_from",
        "price_status",
        "availability_status",
        "approval_status",
        "public_status",
        "status",
        "last_updated_at",
        "created_at",
        "updated_at",
        "company:companies(id, name_ar)",
        "branch:branches(id, district, address_ar)",
        "car:cars(id, brand_ar, model_ar, year)",
        "city:cities(id, slug, name_ar)",
      ].join(", "),
    )
    .order("last_updated_at", { ascending: false, nullsFirst: false });

  if (opts.approval_status) q = q.eq("approval_status", opts.approval_status);
  if (opts.public_status) q = q.eq("public_status", opts.public_status);
  if (opts.company_id) q = q.eq("company_id", opts.company_id);

  const { data, error } = await q;
  if (error) {
    console.error("[listOffersForAdmin] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminOfferListRow[];
}
