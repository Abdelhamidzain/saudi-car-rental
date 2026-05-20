/**
 * Insert / update wrappers for public.offers.
 *
 * Two non-obvious behaviours implemented here:
 *
 *   1. Branch–company FK consistency check (catch URL-tampering): we read the
 *      branch and confirm branch.company_id matches the payload's company_id.
 *      We also derive offer.city_id from branch.city_id (the form doesn't
 *      send city_id at all).
 *
 *   2. last_updated_at discipline: on UPDATE we read the prior row and bump
 *      last_updated_at = now() ONLY when one of daily/weekly/monthly price
 *      or availability_status changed. On INSERT we always set it to now().
 *
 * Caller MUST have enforced admin/owner role.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { OfferFormPayload } from "./validate";

export type UpsertOfferResult =
  | { ok: true; id: string }
  | { ok: false; error: "invalid_branch" | "invalid_company" | "invalid_car" | "invalid_city" | "invalid_airport" | "constraint_failed" | "server_error"; message: string };

function mapPgError(err: unknown): UpsertOfferResult {
  const e = err as { code?: string; message?: string };
  const msg = e?.message ?? "";

  if (/offers_company_id|foreign key.*company/i.test(msg)) {
    return { ok: false, error: "invalid_company", message: "Company not found." };
  }
  if (/offers_branch_id|foreign key.*branch/i.test(msg)) {
    return { ok: false, error: "invalid_branch", message: "Branch not found." };
  }
  if (/offers_car_id|foreign key.*car/i.test(msg)) {
    return { ok: false, error: "invalid_car", message: "Car not found." };
  }
  if (/offers_city_id|foreign key.*city/i.test(msg)) {
    return { ok: false, error: "invalid_city", message: "City not found." };
  }
  if (/offers_airport_id|foreign key.*airport/i.test(msg)) {
    return { ok: false, error: "invalid_airport", message: "Airport not found." };
  }
  if (
    /offers_daily_price_non_negative|offers_weekly_price_non_negative|offers_monthly_price_non_negative|offers_deposit_non_negative|offers_mileage_non_negative/.test(
      msg,
    )
  ) {
    return { ok: false, error: "constraint_failed", message: "A numeric value must be non-negative." };
  }
  console.error("[offers/upsert] failed", err);
  return { ok: false, error: "server_error", message: "Failed to save offer." };
}

/**
 * Confirms branch belongs to the given company and returns its city_id.
 * Null on lookup failure.
 */
async function resolveBranchCityForCompany(
  branchId: string,
  companyId: string,
): Promise<{ ok: true; cityId: string } | { ok: false; error: "invalid_branch"; message: string }> {
  const { data, error } = await getSupabaseAdminClient()
    .from("branches")
    .select("id, company_id, city_id")
    .eq("id", branchId)
    .maybeSingle<{ id: string; company_id: string; city_id: string }>();
  if (error || !data) {
    return { ok: false, error: "invalid_branch", message: "Branch not found." };
  }
  if (data.company_id !== companyId) {
    return { ok: false, error: "invalid_branch", message: "Branch does not belong to the selected company." };
  }
  return { ok: true, cityId: data.city_id };
}

function buildInsertRow(payload: OfferFormPayload, cityId: string, nowIso: string) {
  return {
    company_id: payload.company_id,
    branch_id: payload.branch_id,
    car_id: payload.car_id,
    city_id: cityId,
    airport_id: payload.airport_id,
    daily_price_from: payload.daily_price_from,
    weekly_price_from: payload.weekly_price_from,
    monthly_price_from: payload.monthly_price_from,
    deposit_amount: payload.deposit_amount,
    insurance_included: payload.insurance_included,
    insurance_type: payload.insurance_type,
    mileage_limit: payload.mileage_limit,
    delivery_available: payload.delivery_available,
    airport_delivery_available: payload.airport_delivery_available,
    price_status: payload.price_status,
    availability_status: payload.availability_status,
    approval_status: payload.approval_status,
    public_status: payload.public_status,
    status: payload.status,
    last_updated_at: nowIso,
  };
}

export async function insertOffer(payload: OfferFormPayload): Promise<UpsertOfferResult> {
  const resolved = await resolveBranchCityForCompany(payload.branch_id, payload.company_id);
  if (!resolved.ok) return resolved;

  const row = buildInsertRow(payload, resolved.cityId, new Date().toISOString());

  const { data, error } = await getSupabaseAdminClient()
    .from("offers")
    .insert(row as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) return mapPgError(error);
  if (!data?.id) return { ok: false, error: "server_error", message: "Insert returned no id." };
  return { ok: true, id: data.id };
}

export async function updateOffer(id: string, payload: OfferFormPayload): Promise<UpsertOfferResult> {
  const resolved = await resolveBranchCityForCompany(payload.branch_id, payload.company_id);
  if (!resolved.ok) return resolved;

  // Read the prior row to decide whether to bump last_updated_at.
  const { data: prior, error: priorErr } = await getSupabaseAdminClient()
    .from("offers")
    .select("daily_price_from, weekly_price_from, monthly_price_from, availability_status")
    .eq("id", id)
    .maybeSingle<{
      daily_price_from: number | null;
      weekly_price_from: number | null;
      monthly_price_from: number | null;
      availability_status: string;
    }>();
  if (priorErr || !prior) {
    return { ok: false, error: "server_error", message: "Offer not found." };
  }

  const priceOrAvailabilityChanged =
    Number(prior.daily_price_from ?? -1) !== Number(payload.daily_price_from ?? -1) ||
    Number(prior.weekly_price_from ?? -1) !== Number(payload.weekly_price_from ?? -1) ||
    Number(prior.monthly_price_from ?? -1) !== Number(payload.monthly_price_from ?? -1) ||
    prior.availability_status !== payload.availability_status;

  const row: Record<string, unknown> = buildInsertRow(payload, resolved.cityId, prior == null ? new Date().toISOString() : "");
  // Override last_updated_at handling: only bump when changed.
  if (priceOrAvailabilityChanged) {
    row.last_updated_at = new Date().toISOString();
  } else {
    delete row.last_updated_at;
  }

  const { error } = await getSupabaseAdminClient()
    .from("offers")
    .update(row as never)
    .eq("id", id);
  if (error) return mapPgError(error);
  return { ok: true, id };
}
