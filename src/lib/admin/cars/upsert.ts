/**
 * Insert / update wrappers around `public.cars`.
 * Caller MUST have enforced an admin/owner role.
 *
 * `updateCar` only writes the columns present on the form payload — the
 * existing `features_json` is preserved untouched on edit (we never set it
 * to null from this code path).
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CarFormPayload } from "./validate";

export type UpsertCarResult =
  | { ok: true; id: string }
  | { ok: false; error: "slug_taken" | "invalid_category" | "constraint_failed" | "server_error"; message: string };

function mapPgError(err: unknown): UpsertCarResult {
  const e = err as { code?: string; message?: string };
  const msg = e?.message ?? "";

  if (e?.code === "23505" || /cars_slug_key|duplicate key/i.test(msg)) {
    return { ok: false, error: "slug_taken", message: "Slug already taken — choose another." };
  }
  if (e?.code === "23503" || /cars_category_id|foreign key.*category/i.test(msg)) {
    return { ok: false, error: "invalid_category", message: "Category not found." };
  }
  if (/cars_year_range|cars_seats_range|cars_transmission_check|cars_slug_format/.test(msg)) {
    return { ok: false, error: "constraint_failed", message: "Invalid field value." };
  }
  console.error("[cars/upsert] failed", err);
  return { ok: false, error: "server_error", message: "Failed to save car." };
}

export async function insertCar(payload: CarFormPayload): Promise<UpsertCarResult> {
  const { data, error } = await getSupabaseAdminClient()
    .from("cars")
    .insert(payload as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) return mapPgError(error);
  if (!data?.id) return { ok: false, error: "server_error", message: "Insert returned no id." };
  return { ok: true, id: data.id };
}

export async function updateCar(id: string, payload: CarFormPayload): Promise<UpsertCarResult> {
  const { error } = await getSupabaseAdminClient()
    .from("cars")
    .update(payload as never)
    .eq("id", id);
  if (error) return mapPgError(error);
  return { ok: true, id };
}
