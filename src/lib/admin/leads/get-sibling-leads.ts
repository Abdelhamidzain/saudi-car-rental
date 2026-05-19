/**
 * Admin-side sibling-lead lookup.
 *
 * Used by `/admin/leads/[id]` to render the Potential Duplicates notice.
 * Joins `cities` so the admin sees the city in each sibling row.
 *
 * Service-role read. Caller must have already enforced an admin role.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const SIBLING_WINDOW_MS = 24 * 60 * 60 * 1000;
const SIBLING_LIMIT = 5;

export type AdminSiblingLead = {
  id: string;
  lead_number: string | null;
  status: string;
  created_at: string;
  city: { slug: string; name_ar: string } | null;
};

export async function getSiblingLeadsForAdmin(input: {
  phone: string;
  excludeLeadId: string;
}): Promise<AdminSiblingLead[]> {
  const sinceIso = new Date(Date.now() - SIBLING_WINDOW_MS).toISOString();

  const { data, error } = await getSupabaseAdminClient()
    .from("leads")
    .select("id, lead_number, status, created_at, city:cities(slug, name_ar)")
    .eq("customer_phone", input.phone)
    .neq("id", input.excludeLeadId)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(SIBLING_LIMIT);

  if (error) {
    console.error("[getSiblingLeadsForAdmin] query failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminSiblingLead[];
}
