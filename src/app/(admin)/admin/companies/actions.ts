"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/require-role";
import { validateCompanyInput } from "@/lib/admin/companies/validate";
import { insertCompany, updateCompany } from "@/lib/admin/companies/upsert";

export type CompanyActionResult =
  | { ok: true; id: string }
  | { ok: false; field?: string; error: string };

function formToPayload(formData: FormData): Record<string, unknown> {
  return {
    name_ar: formData.get("name_ar"),
    name_en: formData.get("name_en"),
    slug: formData.get("slug"),
    logo_url: formData.get("logo_url"),
    website_url: formData.get("website_url"),
    google_maps_url: formData.get("google_maps_url"),
    trust_level: formData.get("trust_level"),
    public_status: formData.get("public_status"),
    status: formData.get("status"),
    internal_notes: formData.get("internal_notes"),
  };
}

const FIELD_ERRORS: Record<string, string> = {
  required: "This field is required.",
  invalid_format: "Slug must contain only lowercase letters, numbers, and hyphens.",
  invalid_url: "Enter a valid URL (http:// or https://).",
  invalid_value: "Invalid value.",
};

function mapValidationError(field: string, reason: string): { field: string; error: string } {
  return { field, error: FIELD_ERRORS[reason] ?? `Invalid ${field}` };
}

export async function createCompanyAction(formData: FormData): Promise<CompanyActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };

  const v = validateCompanyInput(formToPayload(formData));
  if (!v.ok) return { ok: false, ...mapValidationError(v.field, v.reason) };

  const result = await insertCompany(v.value);
  if (!result.ok) {
    if (result.error === "slug_taken") return { ok: false, field: "slug", error: result.message };
    return { ok: false, error: result.message };
  }

  revalidatePath("/admin/companies");
  redirect(`/admin/companies/${result.id}`);
}

export async function updateCompanyAction(id: string, formData: FormData): Promise<CompanyActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };

  const v = validateCompanyInput(formToPayload(formData));
  if (!v.ok) return { ok: false, ...mapValidationError(v.field, v.reason) };

  const result = await updateCompany(id, v.value);
  if (!result.ok) {
    if (result.error === "slug_taken") return { ok: false, field: "slug", error: result.message };
    return { ok: false, error: result.message };
  }

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${id}`);
  return { ok: true, id };
}
