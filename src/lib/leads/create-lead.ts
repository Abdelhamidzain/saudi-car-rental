"use server";

/**
 * createLead — public server action invoked from <LeadForm/>.
 *
 * Responsibilities:
 *   1. Honeypot drop — return fake success without writing anything.
 *   2. Structural validation (validateCreateLeadInput).
 *   3. Saudi phone normalization (normalizeSaudiPhone).
 *   4. Slug → UUID resolution for city / category / car / airport.
 *   5. Compute rental_days, set request_type, force consent + version + IP.
 *   6. Single RPC call create_lead_with_activity_log — atomic write of the
 *      lead row + its lead_activity_logs entry.
 *   7. Map any DB error to a generic Arabic message; never expose raw text.
 *
 * Per the MVP scope: this action does NOT auto-select a company or offer.
 *   - selected_company_id and selected_offer_id are always null.
 *   - request_type is always 'best_offer' for current static pages.
 */

import { headers } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { CONSENT_TEXT_VERSION } from "./consent";
import { normalizeSaudiPhone } from "./normalize-phone";
import {
  computeRentalDays,
  validateCreateLeadInput,
} from "./validate";
import {
  getAirportIdBySlug,
  getCarIdBySlug,
  getCategoryIdBySlug,
  getCityIdBySlug,
} from "./lookup";
import type { CreateLeadError, CreateLeadInput, CreateLeadResult } from "./types";

const MSG_AR: Record<CreateLeadError, string> = {
  validation: "بعض الحقول غير مكتملة أو غير صحيحة. يرجى المراجعة والمحاولة مرة أخرى.",
  phone_format: "رقم الجوال غير صحيح. الصيغة المطلوبة: 05XXXXXXXX",
  unknown_city: "المدينة المختارة غير متاحة حالياً.",
  unknown_category: "فئة السيارة المختارة غير متاحة حالياً.",
  unknown_car: "السيارة المختارة غير متاحة حالياً.",
  unknown_airport: "المطار المختار غير متاح حالياً.",
  server_error: "تعذّر إرسال الطلب. حاول مجدداً بعد قليل.",
};

function fail(error: CreateLeadError): CreateLeadResult {
  return { ok: false, error, message_ar: MSG_AR[error] };
}

async function extractClientIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

export async function createLead(
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  // 1. Honeypot — bots fill the hidden field; humans don't.
  if (input.honey && input.honey.trim().length > 0) {
    return { ok: true, lead_number: "SCR-000000-00000" };
  }

  // 2. Structural validation.
  const v = validateCreateLeadInput(input);
  if (!v.ok) return fail("validation");

  // 3. Phone normalization.
  const phone = normalizeSaudiPhone(v.value.customer_phone);
  if (!phone) return fail("phone_format");

  // 4. Slug → id resolution. City is required; others optional.
  const [cityId, categoryId, carId, airportId] = await Promise.all([
    getCityIdBySlug(v.value.city_slug),
    v.value.category_slug ? getCategoryIdBySlug(v.value.category_slug) : Promise.resolve(null),
    v.value.selected_car_slug ? getCarIdBySlug(v.value.selected_car_slug) : Promise.resolve(null),
    v.value.airport_slug ? getAirportIdBySlug(v.value.airport_slug) : Promise.resolve(null),
  ]);

  if (!cityId) return fail("unknown_city");
  if (v.value.category_slug && !categoryId) return fail("unknown_category");
  if (v.value.selected_car_slug && !carId) return fail("unknown_car");
  if (v.value.airport_slug && !airportId) return fail("unknown_airport");

  const rental_days = computeRentalDays(v.value.pickup_date, v.value.return_date);
  const consent_ip = await extractClientIp();

  // 5. Atomic insert via RPC.
  const log_metadata = {
    source_page: v.value.source_page,
    utm: v.value.utm,
    request_type: v.value.request_type,
  };

  // Cast: Database.Functions is an empty placeholder until types.ts is
  // regenerated from the live schema (`supabase gen types …`). Once that
  // runs, this cast becomes unnecessary.
  const rpcArgs = {
    p_customer_phone: phone,
    p_city_id: cityId,
    p_pickup_date: v.value.pickup_date,
    p_return_date: v.value.return_date,
    p_rental_days: rental_days,
    p_request_type: v.value.request_type,
    p_category_id: categoryId,
    p_selected_car_id: carId,
    p_selected_offer_id: null,
    p_selected_company_id: null,
    p_airport_id: airportId,
    p_pickup_location: v.value.pickup_location,
    p_source_page: v.value.source_page,
    p_utm_source: v.value.utm.source,
    p_utm_medium: v.value.utm.medium,
    p_utm_campaign: v.value.utm.campaign,
    p_utm_content: v.value.utm.content,
    p_utm_term: v.value.utm.term,
    p_consent_text_version: CONSENT_TEXT_VERSION,
    p_consent_ip: consent_ip,
    p_log_metadata: log_metadata,
  };

  const { data, error } = await getSupabaseAdminClient().rpc(
    "create_lead_with_activity_log" as never,
    rpcArgs as never,
  );

  if (error || !data) {
    console.error("[createLead] rpc failed", error);
    return fail("server_error");
  }

  // RPC returns table(lead_id uuid, lead_number text). PostgREST returns it
  // as an array of rows.
  const row = Array.isArray(data) ? data[0] : data;
  const leadNumber =
    row && typeof row === "object" && "lead_number" in row
      ? (row as { lead_number: string }).lead_number
      : null;

  if (!leadNumber) {
    console.error("[createLead] rpc returned no lead_number", data);
    return fail("server_error");
  }

  return { ok: true, lead_number: leadNumber };
}
