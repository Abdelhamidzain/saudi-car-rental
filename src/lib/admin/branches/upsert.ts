/**
 * Insert / update wrappers around `public.branches`.
 * Caller MUST have enforced admin/owner role.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BranchFormPayload } from "./validate";

export type UpsertBranchResult =
  | { ok: true; id: string }
  | { ok: false; error: "invalid_company" | "invalid_city" | "invalid_whatsapp" | "server_error"; message: string };

function mapPgError(err: unknown): UpsertBranchResult {
  const e = err as { code?: string; message?: string };
  const msg = e?.message ?? "";
  if (/branches_whatsapp_format/.test(msg)) {
    return { ok: false, error: "invalid_whatsapp", message: "WhatsApp number must be in Saudi format (+9665XXXXXXXX)." };
  }
  if (/foreign key.*company/i.test(msg) || /branches_company_id/.test(msg)) {
    return { ok: false, error: "invalid_company", message: "Company not found." };
  }
  if (/foreign key.*city/i.test(msg) || /branches_city_id/.test(msg)) {
    return { ok: false, error: "invalid_city", message: "City not found." };
  }
  console.error("[branches/upsert] failed", err);
  return { ok: false, error: "server_error", message: "Failed to save branch." };
}

export async function insertBranch(
  companyId: string,
  payload: BranchFormPayload,
): Promise<UpsertBranchResult> {
  const { data, error } = await getSupabaseAdminClient()
    .from("branches")
    .insert({ ...payload, company_id: companyId } as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) return mapPgError(error);
  if (!data?.id) return { ok: false, error: "server_error", message: "Insert returned no id." };
  return { ok: true, id: data.id };
}

export async function updateBranch(
  id: string,
  payload: BranchFormPayload,
): Promise<UpsertBranchResult> {
  const { error } = await getSupabaseAdminClient()
    .from("branches")
    .update(payload as never)
    .eq("id", id);
  if (error) return mapPgError(error);
  return { ok: true, id };
}
