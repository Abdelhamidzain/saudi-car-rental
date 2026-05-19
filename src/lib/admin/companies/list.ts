/**
 * Admin companies list — for /admin/companies.
 *
 * Differs from the routing-picker variant (src/lib/admin/routing/list-companies.ts)
 * by NOT filtering on status — admin needs to see inactive/archived too.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  EntityStatus,
  PublicStatus,
  TrustLevel,
} from "./validate";

export type AdminCompanyListRow = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  trust_level: TrustLevel;
  public_status: PublicStatus;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
};

export async function listCompaniesForAdmin(opts: {
  status?: EntityStatus | null;
  public_status?: PublicStatus | null;
} = {}): Promise<AdminCompanyListRow[]> {
  let q = getSupabaseAdminClient()
    .from("companies")
    .select(
      "id, name_ar, name_en, slug, trust_level, public_status, status, created_at, updated_at",
    )
    .order("name_ar", { ascending: true });

  if (opts.status) q = q.eq("status", opts.status);
  if (opts.public_status) q = q.eq("public_status", opts.public_status);

  const { data, error } = await q;
  if (error) {
    console.error("[listCompaniesForAdmin] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminCompanyListRow[];
}
