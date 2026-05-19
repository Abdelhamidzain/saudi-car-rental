/**
 * Hand-rolled validation for the createLead payload.
 *
 * Kept dependency-free (no Zod) — the input shape is small and stable, and
 * the project hasn't pulled in a schema library yet. If the surface grows,
 * switch to Zod in a follow-up.
 *
 * Returns either { ok: true, value } with a typed/cleaned payload, or
 * { ok: false, field, reason } so the caller can map to an Arabic message.
 */

import type { CreateLeadInput, CreateLeadUtm, RequestType } from "./types";
import { stripUrlsFromNotes } from "./sanitize-notes-urls";
import { todayInRiyadh } from "./date-utils";

const SLUG_RE = /^[a-z0-9-]{1,80}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UTM_VALUE_RE = /^[A-Za-z0-9._\- ]{1,100}$/;

const MAX_RENTAL_SPAN_DAYS = 365;
const MAX_CUSTOMER_NOTES_LENGTH = 500;

export type ValidatedLeadInput = {
  customer_phone: string;
  city_slug: string;
  pickup_date: string;
  return_date: string;
  category_slug: string | null;
  selected_car_slug: string | null;
  airport_slug: string | null;
  request_type: RequestType;
  pickup_location: string | null;
  customer_notes: string | null;
  source_page: string;
  utm: Required<CreateLeadUtm>;
  honey: string;
};

export type ValidationFailure = {
  ok: false;
  field: string;
  reason: string;
};

export type ValidationSuccess = {
  ok: true;
  value: ValidatedLeadInput;
};

function diffDays(fromIso: string, toIso: string): number {
  const from = Date.UTC(
    Number(fromIso.slice(0, 4)),
    Number(fromIso.slice(5, 7)) - 1,
    Number(fromIso.slice(8, 10)),
  );
  const to = Date.UTC(
    Number(toIso.slice(0, 4)),
    Number(toIso.slice(5, 7)) - 1,
    Number(toIso.slice(8, 10)),
  );
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(5, 7));
  const d = Number(value.slice(8, 10));
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function cleanUtm(input: CreateLeadUtm | null | undefined): Required<CreateLeadUtm> {
  const pick = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    if (!trimmed) return null;
    if (!UTM_VALUE_RE.test(trimmed)) return null;
    return trimmed;
  };
  return {
    source: pick(input?.source),
    medium: pick(input?.medium),
    campaign: pick(input?.campaign),
    content: pick(input?.content),
    term: pick(input?.term),
  };
}

export function validateCreateLeadInput(
  raw: CreateLeadInput,
): ValidationSuccess | ValidationFailure {
  // honey — pass through (server decides what to do with it)
  const honey = typeof raw.honey === "string" ? raw.honey : "";

  // city_slug
  if (!raw.city_slug || !SLUG_RE.test(raw.city_slug)) {
    return { ok: false, field: "city_slug", reason: "invalid_slug" };
  }

  // pickup_date / return_date
  if (!raw.pickup_date || !isValidIsoDate(raw.pickup_date)) {
    return { ok: false, field: "pickup_date", reason: "invalid_date" };
  }
  if (!raw.return_date || !isValidIsoDate(raw.return_date)) {
    return { ok: false, field: "return_date", reason: "invalid_date" };
  }

  const today = todayInRiyadh();
  if (raw.pickup_date < today) {
    return { ok: false, field: "pickup_date", reason: "in_past" };
  }
  if (raw.return_date < raw.pickup_date) {
    return { ok: false, field: "return_date", reason: "before_pickup" };
  }
  const span = diffDays(raw.pickup_date, raw.return_date);
  if (span > MAX_RENTAL_SPAN_DAYS) {
    return { ok: false, field: "return_date", reason: "span_too_long" };
  }

  // optional slugs
  const category_slug =
    raw.category_slug && raw.category_slug.length > 0 ? raw.category_slug : null;
  if (category_slug && !SLUG_RE.test(category_slug)) {
    return { ok: false, field: "category_slug", reason: "invalid_slug" };
  }
  const selected_car_slug =
    raw.selected_car_slug && raw.selected_car_slug.length > 0
      ? raw.selected_car_slug
      : null;
  if (selected_car_slug && !SLUG_RE.test(selected_car_slug)) {
    return { ok: false, field: "selected_car_slug", reason: "invalid_slug" };
  }
  const airport_slug =
    raw.airport_slug && raw.airport_slug.length > 0 ? raw.airport_slug : null;
  if (airport_slug && !SLUG_RE.test(airport_slug)) {
    return { ok: false, field: "airport_slug", reason: "invalid_slug" };
  }

  // request_type — MVP: must be 'best_offer'. 'selected_offer' is reserved
  // for future DB-driven offer pages and isn't reachable from current forms.
  if (raw.request_type !== "best_offer" && raw.request_type !== "selected_offer") {
    return { ok: false, field: "request_type", reason: "invalid_value" };
  }

  // pickup_location
  let pickup_location: string | null = null;
  if (typeof raw.pickup_location === "string") {
    const trimmed = raw.pickup_location.trim().slice(0, 200);
    pickup_location = trimmed.length > 0 ? trimmed : null;
  }

  // customer_notes — optional, ≤ 500 chars after sanitization.
  // Sanitization pipeline:
  //   - normalize CRLF/CR to LF
  //   - strip ASCII control chars except newline (0x0A) and tab (0x09)
  //   - strip URLs (Task 3.1) — replaced with the placeholder [رابط محذوف]
  //   - trim
  //   - empty result -> null
  // The DB enforces the 500-char cap via CHECK; rejecting here gives a nicer
  // error message and avoids a useless round-trip.
  let customer_notes: string | null = null;
  if (typeof raw.customer_notes === "string") {
    let normalized = raw.customer_notes
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "");
    normalized = stripUrlsFromNotes(normalized).trim();
    if (normalized.length > MAX_CUSTOMER_NOTES_LENGTH) {
      return { ok: false, field: "customer_notes", reason: "too_long" };
    }
    customer_notes = normalized.length === 0 ? null : normalized;
  }

  // source_page
  if (
    typeof raw.source_page !== "string" ||
    !raw.source_page.startsWith("/") ||
    raw.source_page.length > 500
  ) {
    return { ok: false, field: "source_page", reason: "invalid_source_page" };
  }

  // customer_phone — keep raw; normalization happens in the server action.
  if (typeof raw.customer_phone !== "string" || raw.customer_phone.length === 0) {
    return { ok: false, field: "customer_phone", reason: "missing" };
  }

  return {
    ok: true,
    value: {
      customer_phone: raw.customer_phone,
      city_slug: raw.city_slug,
      pickup_date: raw.pickup_date,
      return_date: raw.return_date,
      category_slug,
      selected_car_slug,
      airport_slug,
      request_type: raw.request_type,
      pickup_location,
      customer_notes,
      source_page: raw.source_page.slice(0, 500),
      utm: cleanUtm(raw.utm),
      honey,
    },
  };
}

export function computeRentalDays(pickupIso: string, returnIso: string): number {
  const days = diffDays(pickupIso, returnIso);
  return days < 1 ? 1 : days;
}
