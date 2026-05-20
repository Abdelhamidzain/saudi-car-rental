"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/require-role";
import { validateOfferInput, type OfferFormPayload } from "@/lib/admin/offers/validate";
import { insertOffer, updateOffer } from "@/lib/admin/offers/upsert";

export type OfferActionResult =
  | { ok: true; id: string }
  | { ok: false; field?: string; error: string };

function formToPayload(formData: FormData): Record<string, unknown> {
  return {
    company_id: formData.get("company_id"),
    branch_id: formData.get("branch_id"),
    car_id: formData.get("car_id"),
    airport_id: formData.get("airport_id"),
    daily_price_from: formData.get("daily_price_from"),
    weekly_price_from: formData.get("weekly_price_from"),
    monthly_price_from: formData.get("monthly_price_from"),
    deposit_amount: formData.get("deposit_amount"),
    insurance_included: formData.get("insurance_included"),
    insurance_type: formData.get("insurance_type"),
    mileage_limit: formData.get("mileage_limit"),
    delivery_available: formData.get("delivery_available"),
    airport_delivery_available: formData.get("airport_delivery_available"),
    price_status: formData.get("price_status"),
    availability_status: formData.get("availability_status"),
    approval_status: formData.get("approval_status"),
    public_status: formData.get("public_status"),
    status: formData.get("status"),
  };
}

const FIELD_ERRORS: Record<string, string> = {
  required: "This field is required.",
  invalid_value: "Invalid value.",
  invalid_number: "Enter a valid number with up to two decimal places.",
  invalid_int: "Must be a whole number.",
  negative: "Must be zero or greater.",
  at_least_one_price: "Enter at least one price tier (daily, weekly, or monthly).",
  not_approved_for_publish: "Cannot publish: offer is not approved.",
};

function mapValidationError(field: string, reason: string): { field: string; error: string } {
  return { field, error: FIELD_ERRORS[reason] ?? `Invalid ${field}` };
}

/**
 * Soft auto-reset: if admin marks the offer as rejected, force public_status
 * to 'hidden' so a stale-published offer doesn't linger. Quietly applied —
 * no error surfaced.
 */
function applyRejectAutoReset(payload: OfferFormPayload): OfferFormPayload {
  if (payload.approval_status === "rejected" && payload.public_status === "published") {
    return { ...payload, public_status: "hidden" };
  }
  return payload;
}

export async function createOfferAction(formData: FormData): Promise<OfferActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };

  const v = validateOfferInput(formToPayload(formData));
  if (!v.ok) return { ok: false, ...mapValidationError(v.field, v.reason) };

  const payload = applyRejectAutoReset(v.value);

  const result = await insertOffer(payload);
  if (!result.ok) {
    const field = result.error === "invalid_branch" ? "branch_id"
      : result.error === "invalid_company" ? "company_id"
      : result.error === "invalid_car" ? "car_id"
      : result.error === "invalid_airport" ? "airport_id"
      : undefined;
    return { ok: false, field, error: result.message };
  }

  revalidatePath("/admin/offers");
  redirect(`/admin/offers/${result.id}`);
}

export async function updateOfferAction(id: string, formData: FormData): Promise<OfferActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };

  const v = validateOfferInput(formToPayload(formData));
  if (!v.ok) return { ok: false, ...mapValidationError(v.field, v.reason) };

  const payload = applyRejectAutoReset(v.value);

  const result = await updateOffer(id, payload);
  if (!result.ok) {
    const field = result.error === "invalid_branch" ? "branch_id"
      : result.error === "invalid_company" ? "company_id"
      : result.error === "invalid_car" ? "car_id"
      : result.error === "invalid_airport" ? "airport_id"
      : undefined;
    return { ok: false, field, error: result.message };
  }

  revalidatePath("/admin/offers");
  revalidatePath(`/admin/offers/${id}`);
  return { ok: true, id };
}
