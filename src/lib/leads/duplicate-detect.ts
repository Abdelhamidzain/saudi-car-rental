/**
 * Phone-based duplicate detection.
 *
 * Per `ai-docs/06_LEAD_MANAGEMENT_WORKFLOW.md`: we do NOT block duplicate
 * submissions in MVP. Instead, after the lead is created we look for sibling
 * leads (same normalized phone, last 24h) and write a system-actor activity
 * log row so the admin sees the warning on the detail page.
 *
 * Two operations:
 *   - findRecentSiblingLeads(phone, excludeLeadId)  — read-only
 *   - logPotentialDuplicate(leadId, siblings)       — insert one log row
 *
 * Both go through the service-role client. Caller MUST be a server context.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const SIBLING_LIMIT = 5;

export type SiblingLead = {
  id: string;
  lead_number: string | null;
  created_at: string;
  status: string;
};

export async function findRecentSiblingLeads(input: {
  phone: string;
  excludeLeadId: string;
}): Promise<SiblingLead[]> {
  const sinceIso = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();

  const { data, error } = await getSupabaseAdminClient()
    .from("leads")
    .select("id, lead_number, created_at, status")
    .eq("customer_phone", input.phone)
    .neq("id", input.excludeLeadId)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(SIBLING_LIMIT);

  if (error) {
    console.error("[findRecentSiblingLeads] query failed", error);
    return [];
  }
  return (data ?? []) as unknown as SiblingLead[];
}

export async function logPotentialDuplicate(input: {
  lead_id: string;
  siblings: SiblingLead[];
}): Promise<void> {
  if (input.siblings.length === 0) return;

  const description =
    `Same phone has submitted ${input.siblings.length} other request` +
    `${input.siblings.length === 1 ? "" : "s"} in the last 24h.`;

  const { error } = await getSupabaseAdminClient()
    .from("lead_activity_logs")
    .insert({
      lead_id: input.lead_id,
      event_type: "lead_potential_duplicate",
      title: "Potential duplicate detected",
      description,
      actor_type: "system",
      metadata_json: {
        sibling_count: input.siblings.length,
        siblings: input.siblings.map(s => ({
          id: s.id,
          lead_number: s.lead_number,
          created_at: s.created_at,
          status: s.status,
        })),
      },
    } as never);

  if (error) {
    // Log only — never break the user flow if the audit insert fails.
    console.error("[logPotentialDuplicate] insert failed (non-fatal)", error);
  }
}
