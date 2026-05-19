/**
 * Insert / update wrappers around `public.companies`.
 * Caller MUST have enforced an admin/owner role beforehand.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CompanyFormPayload } from "./validate";

export type UpsertCompanyResult =
  | { ok: true; id: string }
  | { ok: false; error: "slug_taken" | "server_error"; message: string };

function mapPgError(err: unknown): UpsertCompanyResult {
  const e = err as { code?: string; message?: string };
  if (e?.code === "23505" || /companies_slug_key|duplicate key/i.test(e?.message ?? "")) {
    return { ok: false, error: "slug_taken", message: "Slug already taken — choose another." };
  }
  console.error("[companies/upsert] failed", err);
  return { ok: false, error: "server_error", message: "Failed to save company." };
}

export async function insertCompany(payload: CompanyFormPayload): Promise<UpsertCompanyResult> {
  const { data, error } = await getSupabaseAdminClient()
    .from("companies")
    .insert(payload as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) return mapPgError(error);
  if (!data?.id) return { ok: false, error: "server_error", message: "Insert returned no id." };
  return { ok: true, id: data.id };
}

export async function updateCompany(id: string, payload: CompanyFormPayload): Promise<UpsertCompanyResult> {
  const { error } = await getSupabaseAdminClient()
    .from("companies")
    .update(payload as never)
    .eq("id", id);
  if (error) return mapPgError(error);
  return { ok: true, id };
}
