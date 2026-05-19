/**
 * Atomic admin status update — calls the update_lead_status_with_log RPC.
 *
 * Service-role client is used to invoke the RPC. The actor user id passed in
 * MUST come from the authenticated session, never from client input.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeadStatus } from "./list-leads";

export type UpdateLeadStatusResult =
  | { ok: true; lead_id: string; old_status: LeadStatus; new_status: LeadStatus }
  | { ok: false; error: "not_found" | "server_error"; message: string };

export async function updateLeadStatus(input: {
  lead_id: string;
  new_status: LeadStatus;
  actor_user_id: string;
  note?: string | null;
}): Promise<UpdateLeadStatusResult> {
  const args = {
    p_lead_id: input.lead_id,
    p_new_status: input.new_status,
    p_actor_user_id: input.actor_user_id,
    p_note: input.note ?? null,
  };

  const { data, error } = await getSupabaseAdminClient().rpc(
    "update_lead_status_with_log" as never,
    args as never,
  );

  if (error) {
    const msg = (error as { message?: string }).message ?? "";
    if (msg.includes("not found")) {
      return { ok: false, error: "not_found", message: "Lead not found." };
    }
    console.error("[updateLeadStatus] rpc failed", error);
    return { ok: false, error: "server_error", message: "Failed to update status." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    return { ok: false, error: "server_error", message: "Unexpected response." };
  }
  const r = row as { lead_id: string; old_status: LeadStatus; new_status: LeadStatus };
  return { ok: true, lead_id: r.lead_id, old_status: r.old_status, new_status: r.new_status };
}
