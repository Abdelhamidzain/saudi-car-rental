/**
 * Wrapper around record_routing_sent_with_log. Service-role.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeadStatus } from "@/lib/admin/leads/list-leads";

export type MarkRoutingSentResult =
  | { ok: true; routing_id: string; lead_status_changed: boolean; old_status: LeadStatus; new_status: LeadStatus }
  | { ok: false; error: "not_found" | "server_error"; message: string };

export async function markRoutingSent(input: {
  routing_id: string;
  lead_id: string;
  actor_user_id: string;
  note?: string | null;
}): Promise<MarkRoutingSentResult> {
  const args = {
    p_routing_id: input.routing_id,
    p_lead_id: input.lead_id,
    p_actor_user_id: input.actor_user_id,
    p_note: input.note ?? null,
  };

  const { data, error } = await getSupabaseAdminClient().rpc(
    "record_routing_sent_with_log" as never,
    args as never,
  );

  if (error) {
    const msg = (error as { message?: string }).message ?? "";
    if (msg.includes("not found") || msg.includes("does not belong")) {
      return { ok: false, error: "not_found", message: "Routing not found." };
    }
    console.error("[markRoutingSent] rpc failed", error);
    return { ok: false, error: "server_error", message: "Failed to mark as sent." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    return { ok: false, error: "server_error", message: "Unexpected response." };
  }
  const r = row as {
    routing_id: string;
    lead_status_changed: boolean;
    old_status: LeadStatus;
    new_status: LeadStatus;
  };
  return {
    ok: true,
    routing_id: r.routing_id,
    lead_status_changed: r.lead_status_changed,
    old_status: r.old_status,
    new_status: r.new_status,
  };
}
