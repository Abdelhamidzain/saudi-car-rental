/**
 * Admin: fetch every routing row for a given lead, most recent first.
 * Joined to companies + branches so the UI has display labels in one round-trip.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminLeadRoutingRow = {
  id: string;
  lead_id: string;
  whatsapp_number: string | null;
  generated_message: string | null;
  sent_at: string | null;
  sent_by_user_id: string | null;
  company_response_status:
    | "not_sent"
    | "sent"
    | "replied"
    | "no_response"
    | "rejected"
    | "unavailable"
    | "alternative_offered"
    | "contacted_customer"
    | "deal_done"
    | "deal_lost";
  created_at: string;
  updated_at: string;
  company: { id: string; name_ar: string; name_en: string } | null;
  branch: { id: string; district: string | null; address_ar: string | null } | null;
};

export async function listRoutingsForLead(leadId: string): Promise<AdminLeadRoutingRow[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("lead_company_routing")
    .select(
      [
        "id",
        "lead_id",
        "whatsapp_number",
        "generated_message",
        "sent_at",
        "sent_by_user_id",
        "company_response_status",
        "created_at",
        "updated_at",
        "company:companies(id, name_ar, name_en)",
        "branch:branches(id, district, address_ar)",
      ].join(", "),
    )
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listRoutingsForLead] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminLeadRoutingRow[];
}
