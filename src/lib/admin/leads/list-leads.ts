/**
 * Admin leads list query.
 *
 * Reads through the service-role client (RLS bypass). The caller is expected
 * to have already enforced an admin role via `requireRole(...)`.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type LeadStatus =
  | "new"
  | "reviewed"
  | "sent_to_company"
  | "company_replied"
  | "customer_contacted"
  | "closed_won"
  | "closed_lost"
  | "spam"
  | "duplicate";

export type AdminLeadListRow = {
  id: string;
  lead_number: string | null;
  customer_phone: string;
  status: LeadStatus;
  request_type: "best_offer" | "selected_offer";
  created_at: string;
  updated_at: string;
  city: { slug: string; name_ar: string } | null;
  category: { slug: string; name_ar: string } | null;
};

const HARD_LIMIT = 50;

export async function listLeads(opts: { status?: LeadStatus | null } = {}): Promise<AdminLeadListRow[]> {
  let q = getSupabaseAdminClient()
    .from("leads")
    .select(
      "id, lead_number, customer_phone, status, request_type, created_at, updated_at, city:cities(slug, name_ar), category:car_categories(slug, name_ar)",
    )
    .order("created_at", { ascending: false })
    .limit(HARD_LIMIT);

  if (opts.status) {
    q = q.eq("status", opts.status);
  }

  const { data, error } = await q;
  if (error) {
    console.error("[listLeads] failed", error);
    return [];
  }
  // The select() above produces typed-as-unknown rows because the placeholder
  // Database type has no Tables map. Cast once at the boundary.
  return (data ?? []) as unknown as AdminLeadListRow[];
}
