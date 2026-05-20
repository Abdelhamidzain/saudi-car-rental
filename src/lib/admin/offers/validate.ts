/**
 * Validator for the offer create/edit form.
 *
 * Pure function — no DB. Used by both create and update server actions.
 *
 * Two non-obvious rules baked in here:
 *   - At least one of daily/weekly/monthly price must be set.
 *   - Approval gate: cannot set public_status='published' unless approval_status
 *     is 'approved' or 'auto_approved'.
 *
 * The reject-auto-reset (approval='rejected' → public='hidden') is handled
 * by the server action, NOT the validator, because it mutates the payload.
 */

export type PriceStatus = "starts_from" | "confirmed" | "needs_confirmation";
export type AvailabilityStatus = "available" | "likely_available" | "needs_confirmation" | "unavailable";
export type ApprovalStatus = "pending_review" | "approved" | "rejected" | "auto_approved";
export type OfferPublicStatus = "draft" | "published" | "hidden" | "blocked";
export type OfferEntityStatus = "active" | "inactive" | "archived";

const PRICE_STATUSES: PriceStatus[] = ["starts_from", "confirmed", "needs_confirmation"];
const AVAILABILITY_STATUSES: AvailabilityStatus[] = ["available", "likely_available", "needs_confirmation", "unavailable"];
const APPROVAL_STATUSES: ApprovalStatus[] = ["pending_review", "approved", "rejected", "auto_approved"];
const OFFER_PUBLIC_STATUSES: OfferPublicStatus[] = ["draft", "published", "hidden", "blocked"];
const OFFER_ENTITY_STATUSES: OfferEntityStatus[] = ["active", "inactive", "archived"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type OfferFormPayload = {
  company_id: string;
  branch_id: string;
  car_id: string;
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
};

export type OfferValidationResult =
  | { ok: true; value: OfferFormPayload }
  | { ok: false; field: string; reason: string };

function cleanString(v: unknown, maxLen: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t.length === 0) return null;
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

function parseOptionalDecimal(v: unknown, field: string):
  | { ok: true; value: number | null }
  | { ok: false; field: string; reason: string } {
  if (v === null || v === undefined || v === "") return { ok: true, value: null };
  const s = typeof v === "string" ? v.trim() : String(v);
  if (s === "") return { ok: true, value: null };
  if (!/^-?\d+(\.\d{1,2})?$/.test(s)) return { ok: false, field, reason: "invalid_number" };
  const n = Number(s);
  if (!Number.isFinite(n)) return { ok: false, field, reason: "invalid_number" };
  if (n < 0) return { ok: false, field, reason: "negative" };
  return { ok: true, value: n };
}

function parseOptionalInt(v: unknown, field: string):
  | { ok: true; value: number | null }
  | { ok: false; field: string; reason: string } {
  if (v === null || v === undefined || v === "") return { ok: true, value: null };
  const s = typeof v === "string" ? v.trim() : String(v);
  if (s === "") return { ok: true, value: null };
  if (!/^-?\d+$/.test(s)) return { ok: false, field, reason: "invalid_int" };
  const n = Number(s);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return { ok: false, field, reason: "invalid_int" };
  if (n < 0) return { ok: false, field, reason: "negative" };
  return { ok: true, value: n };
}

function parseCheckbox(v: unknown): boolean {
  return v === true || v === "true" || v === "on" || v === "1";
}

function parseTriBool(v: unknown): boolean | null {
  if (v === true || v === "true" || v === "on") return true;
  if (v === false || v === "false") return false;
  return null;
}

export function validateOfferInput(raw: Record<string, unknown>): OfferValidationResult {
  // ── FKs ──────────────────────────────────────────────────────────────
  const company_id = typeof raw.company_id === "string" ? raw.company_id.trim() : "";
  if (!UUID_RE.test(company_id)) return { ok: false, field: "company_id", reason: "required" };

  const branch_id = typeof raw.branch_id === "string" ? raw.branch_id.trim() : "";
  if (!UUID_RE.test(branch_id)) return { ok: false, field: "branch_id", reason: "required" };

  const car_id = typeof raw.car_id === "string" ? raw.car_id.trim() : "";
  if (!UUID_RE.test(car_id)) return { ok: false, field: "car_id", reason: "required" };

  const airportRaw = typeof raw.airport_id === "string" ? raw.airport_id.trim() : "";
  let airport_id: string | null = null;
  if (airportRaw !== "") {
    if (!UUID_RE.test(airportRaw)) return { ok: false, field: "airport_id", reason: "invalid_value" };
    airport_id = airportRaw;
  }

  // ── Prices ────────────────────────────────────────────────────────────
  const daily = parseOptionalDecimal(raw.daily_price_from, "daily_price_from");
  if (!daily.ok) return daily;
  const weekly = parseOptionalDecimal(raw.weekly_price_from, "weekly_price_from");
  if (!weekly.ok) return weekly;
  const monthly = parseOptionalDecimal(raw.monthly_price_from, "monthly_price_from");
  if (!monthly.ok) return monthly;

  if (daily.value === null && weekly.value === null && monthly.value === null) {
    return { ok: false, field: "daily_price_from", reason: "at_least_one_price" };
  }

  const deposit = parseOptionalDecimal(raw.deposit_amount, "deposit_amount");
  if (!deposit.ok) return deposit;

  const mileage = parseOptionalInt(raw.mileage_limit, "mileage_limit");
  if (!mileage.ok) return mileage;

  // ── Terms ─────────────────────────────────────────────────────────────
  const insurance_included = parseTriBool(raw.insurance_included);
  const insurance_type = cleanString(raw.insurance_type, 200);
  const delivery_available = parseCheckbox(raw.delivery_available);
  const airport_delivery_available = parseCheckbox(raw.airport_delivery_available);

  // ── Workflow enums ────────────────────────────────────────────────────
  const price_status = typeof raw.price_status === "string" ? raw.price_status : "";
  if (!(PRICE_STATUSES as string[]).includes(price_status)) {
    return { ok: false, field: "price_status", reason: "invalid_value" };
  }
  const availability_status = typeof raw.availability_status === "string" ? raw.availability_status : "";
  if (!(AVAILABILITY_STATUSES as string[]).includes(availability_status)) {
    return { ok: false, field: "availability_status", reason: "invalid_value" };
  }
  const approval_status = typeof raw.approval_status === "string" ? raw.approval_status : "";
  if (!(APPROVAL_STATUSES as string[]).includes(approval_status)) {
    return { ok: false, field: "approval_status", reason: "invalid_value" };
  }
  const public_status = typeof raw.public_status === "string" ? raw.public_status : "";
  if (!(OFFER_PUBLIC_STATUSES as string[]).includes(public_status)) {
    return { ok: false, field: "public_status", reason: "invalid_value" };
  }
  const status = typeof raw.status === "string" ? raw.status : "";
  if (!(OFFER_ENTITY_STATUSES as string[]).includes(status)) {
    return { ok: false, field: "status", reason: "invalid_value" };
  }

  // ── Approval gate ─────────────────────────────────────────────────────
  if (public_status === "published" && approval_status !== "approved" && approval_status !== "auto_approved") {
    return { ok: false, field: "public_status", reason: "not_approved_for_publish" };
  }

  return {
    ok: true,
    value: {
      company_id,
      branch_id,
      car_id,
      airport_id,
      daily_price_from: daily.value,
      weekly_price_from: weekly.value,
      monthly_price_from: monthly.value,
      deposit_amount: deposit.value,
      insurance_included,
      insurance_type,
      mileage_limit: mileage.value,
      delivery_available,
      airport_delivery_available,
      price_status: price_status as PriceStatus,
      availability_status: availability_status as AvailabilityStatus,
      approval_status: approval_status as ApprovalStatus,
      public_status: public_status as OfferPublicStatus,
      status: status as OfferEntityStatus,
    },
  };
}

export {
  PRICE_STATUSES,
  AVAILABILITY_STATUSES,
  APPROVAL_STATUSES,
  OFFER_PUBLIC_STATUSES,
  OFFER_ENTITY_STATUSES,
};
