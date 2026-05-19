"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/require-role";
import { validateBranchInput } from "@/lib/admin/branches/validate";
import { insertBranch, updateBranch } from "@/lib/admin/branches/upsert";

export type BranchActionResult =
  | { ok: true; id: string }
  | { ok: false; field?: string; error: string };

function formToPayload(formData: FormData): Record<string, unknown> {
  return {
    city_id: formData.get("city_id"),
    district: formData.get("district"),
    address_ar: formData.get("address_ar"),
    address_en: formData.get("address_en"),
    google_maps_url: formData.get("google_maps_url"),
    phone: formData.get("phone"),
    whatsapp_number: formData.get("whatsapp_number"),
    is_main_branch: formData.get("is_main_branch"),
    status: formData.get("status"),
  };
}

const FIELD_ERRORS: Record<string, string> = {
  required: "This field is required.",
  invalid_url: "Enter a valid URL (http:// or https://).",
  invalid_value: "Invalid value.",
  invalid_saudi_mobile: "WhatsApp must be a Saudi mobile (+9665XXXXXXXX or 05XXXXXXXX).",
};

function mapValidationError(field: string, reason: string): { field: string; error: string } {
  return { field, error: FIELD_ERRORS[reason] ?? `Invalid ${field}` };
}

export async function createBranchAction(
  companyId: string,
  formData: FormData,
): Promise<BranchActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };

  const v = validateBranchInput(formToPayload(formData));
  if (!v.ok) return { ok: false, ...mapValidationError(v.field, v.reason) };

  const result = await insertBranch(companyId, v.value);
  if (!result.ok) {
    const field = result.error === "invalid_whatsapp" ? "whatsapp_number"
      : result.error === "invalid_city" ? "city_id"
      : undefined;
    return { ok: false, field, error: result.message };
  }

  revalidatePath(`/admin/companies/${companyId}`);
  redirect(`/admin/companies/${companyId}`);
}

export async function updateBranchAction(
  branchId: string,
  companyId: string,
  formData: FormData,
): Promise<BranchActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };

  const v = validateBranchInput(formToPayload(formData));
  if (!v.ok) return { ok: false, ...mapValidationError(v.field, v.reason) };

  const result = await updateBranch(branchId, v.value);
  if (!result.ok) {
    const field = result.error === "invalid_whatsapp" ? "whatsapp_number"
      : result.error === "invalid_city" ? "city_id"
      : undefined;
    return { ok: false, field, error: result.message };
  }

  revalidatePath(`/admin/companies/${companyId}`);
  revalidatePath(`/admin/companies/${companyId}/branches/${branchId}`);
  return { ok: true, id: branchId };
}
