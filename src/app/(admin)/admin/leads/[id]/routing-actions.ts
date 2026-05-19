"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/require-role";
import { assignLeadToCompany } from "@/lib/admin/routing/assign-lead";
import { markRoutingSent } from "@/lib/admin/routing/mark-sent";
import { logRoutingEngagement, type RoutingLogEventType } from "@/lib/admin/routing/log-routing-event";

export type AssignLeadActionResult =
  | { ok: true; routing_id: string }
  | { ok: false; error: string };

export async function assignLeadAction(input: {
  lead_id: string;
  company_id: string;
  branch_id: string | null;
  whatsapp_number: string | null;
  generated_message: string;
}): Promise<AssignLeadActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) {
    return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };
  }

  // Trim / sanity-check the message length so a runaway client can't bloat the
  // generated_message column.
  const message = (input.generated_message ?? "").slice(0, 4000);
  if (!input.company_id) {
    return { ok: false, error: "Company is required." };
  }

  const result = await assignLeadToCompany({
    lead_id: input.lead_id,
    company_id: input.company_id,
    branch_id: input.branch_id,
    whatsapp_number: input.whatsapp_number,
    generated_message: message,
    actor_user_id: auth.session.user_id,
  });

  if (!result.ok) return { ok: false, error: result.message };

  revalidatePath(`/admin/leads/${input.lead_id}`);
  revalidatePath("/admin/leads");
  return { ok: true, routing_id: result.routing_id };
}

export type MarkRoutingSentActionResult =
  | { ok: true; lead_status_changed: boolean; new_status: string }
  | { ok: false; error: string };

export async function markRoutingSentAction(
  routingId: string,
  leadId: string,
  formData: FormData,
): Promise<MarkRoutingSentActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) {
    return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };
  }

  const note = String(formData.get("note") ?? "").trim() || null;

  const result = await markRoutingSent({
    routing_id: routingId,
    lead_id: leadId,
    actor_user_id: auth.session.user_id,
    note,
  });

  if (!result.ok) return { ok: false, error: result.message };

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { ok: true, lead_status_changed: result.lead_status_changed, new_status: result.new_status };
}

export type RecordRoutingEventActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function recordRoutingEventAction(
  leadId: string,
  routingId: string,
  eventType: RoutingLogEventType,
): Promise<RecordRoutingEventActionResult> {
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) {
    return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };
  }
  if (eventType !== "whatsapp_copied" && eventType !== "whatsapp_opened") {
    return { ok: false, error: "Invalid event type." };
  }

  const result = await logRoutingEngagement({
    lead_id: leadId,
    routing_id: routingId,
    event_type: eventType,
    actor_user_id: auth.session.user_id,
  });

  if (!result.ok) return { ok: false, error: result.message };

  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}
