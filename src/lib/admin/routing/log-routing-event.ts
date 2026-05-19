/**
 * Single-INSERT activity-log writer used by the Copy / Open WhatsApp buttons.
 *
 * Neither action changes lead or routing state — they only record that the
 * admin engaged with the message. A standalone INSERT is atomic by itself,
 * so no RPC is needed.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type RoutingLogEventType = "whatsapp_copied" | "whatsapp_opened";

const TITLES: Record<RoutingLogEventType, string> = {
  whatsapp_copied: "WhatsApp message copied",
  whatsapp_opened: "WhatsApp opened",
};

export async function logRoutingEngagement(input: {
  lead_id: string;
  routing_id: string;
  event_type: RoutingLogEventType;
  actor_user_id: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await getSupabaseAdminClient()
    .from("lead_activity_logs")
    .insert({
      lead_id: input.lead_id,
      event_type: input.event_type,
      title: TITLES[input.event_type],
      actor_type: "admin",
      actor_id: input.actor_user_id,
      metadata_json: { routing_id: input.routing_id },
    } as never);

  if (error) {
    console.error("[logRoutingEngagement] insert failed", error);
    return { ok: false, message: "Failed to record event." };
  }
  return { ok: true };
}
