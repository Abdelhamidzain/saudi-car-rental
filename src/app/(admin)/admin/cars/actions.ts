"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/require-role";
import { validateCarInput } from "@/lib/admin/cars/validate";
import { insertCar, updateCar } from "@/lib/admin/cars/upsert";

export type CarActionResult =
  | { ok: true; id: string }
  | { ok: false; field?: string; error: string };

function formToPayload(formData: FormData): Record<string, unknown> {
  return {
    brand: formData.get("brand"),
    brand_ar: formData.get("brand_ar"),
    model: formData.get("model"),
    model_ar: formData.get("model_ar"),
    slug: formData.get("slug"),
    year: formData.get("year"),
    category_id: formData.get("category_id"),
    seats: formData.get("seats"),
    transmission: formData.get("transmission"),
    fuel_type: formData.get("fuel_type"),
    image_url: formData.get("image_url"),
    description_ar: formData.get("description_ar"),
    status: formData.get("status"),
  };
}

const FIELD_ERRORS: Record<string, string> = {
  required: "This field is required.",
  invalid_format: "Slug must contain only lowercase letters, numbers, and hyphens.",
  invalid_value: "Invalid value.",
  invalid_url: "Enter a valid URL (http:// or https://).",
  invalid_int: "Must be a whole number.",
  out_of_range: "Value is out of the allowed range.",
};

function mapValidationError(field: string, reason: string): { field: string; error: string } {
  return { field, error: FIELD_ERRORS[reason] ?? `Invalid ${field}` };
}

export async function createCarAction(formData: FormData): Promise<CarActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };

  const v = validateCarInput(formToPayload(formData));
  if (!v.ok) return { ok: false, ...mapValidationError(v.field, v.reason) };

  const result = await insertCar(v.value);
  if (!result.ok) {
    if (result.error === "slug_taken") return { ok: false, field: "slug", error: result.message };
    if (result.error === "invalid_category") return { ok: false, field: "category_id", error: result.message };
    return { ok: false, error: result.message };
  }

  revalidatePath("/admin/cars");
  redirect(`/admin/cars/${result.id}`);
}

export async function updateCarAction(id: string, formData: FormData): Promise<CarActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };

  const v = validateCarInput(formToPayload(formData));
  if (!v.ok) return { ok: false, ...mapValidationError(v.field, v.reason) };

  const result = await updateCar(id, v.value);
  if (!result.ok) {
    if (result.error === "slug_taken") return { ok: false, field: "slug", error: result.message };
    if (result.error === "invalid_category") return { ok: false, field: "category_id", error: result.message };
    return { ok: false, error: result.message };
  }

  revalidatePath("/admin/cars");
  revalidatePath(`/admin/cars/${id}`);
  return { ok: true, id };
}
