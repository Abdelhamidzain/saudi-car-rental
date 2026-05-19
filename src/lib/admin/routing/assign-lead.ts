/**
 * Wrapper around the atomic assign_lead_to_company_with_log RPC.
 * Service-role server call. Caller MUST have enforced an admin role.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AssignLeadResult =
  | { ok: true; routing_id: string }
  | { ok: false; error: "invalid_assignment" | "server_error"; message: string };

export async function assignLeadToCompany(input: {
  lead_id: string;
  company_id: string;
  branch_id: string | null;
  whatsapp_number: string | null;
  generated_message: string;
  actor_user_id: string;
}): Promise<AssignLeadResult> {
  const args = {
    p_lead_id: input.lead_id,
    p_company_id: input.company_id,
    p_branch_id: input.branch_id,
    p_whatsapp_number: input.whatsapp_number,
    p_generated_message: input.generated_message,
    p_actor_user_id: input.actor_user_id,
  };

  const { data, error } = await getSupabaseAdminClient().rpc(
    "assign_lead_to_company_with_log" as never,
    args as never,
  );

  if (error) {
    const msg = (error as { message?: string }).message ?? "";
    if (msg.includes("not found") || msg.includes("does not belong")) {
      return { ok: false, error: "invalid_assignment", message: "Invalid company or branch selection." };
    }
    console.error("[assignLeadToCompany] rpc failed", error);
    return { ok: false, error: "server_error", message: "Failed to assign company." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object" || !("routing_id" in row)) {
    return { ok: false, error: "server_error", message: "Unexpected response." };
  }
  return { ok: true, routing_id: (row as { routing_id: string }).routing_id };
}
