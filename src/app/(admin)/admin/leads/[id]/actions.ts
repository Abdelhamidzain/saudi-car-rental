"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/require-role";
import { updateLeadStatus } from "@/lib/admin/leads/update-lead-status";
import type { LeadStatus } from "@/lib/admin/leads/list-leads";

const ALL_STATUSES: LeadStatus[] = [
  "new", "reviewed", "sent_to_company", "company_replied", "customer_contacted",
  "closed_won", "closed_lost", "spam", "duplicate",
];

export type UpdateStatusActionResult =
  | { ok: true; old_status: LeadStatus; new_status: LeadStatus }
  | { ok: false; error: string };

export async function updateStatusAction(
  leadId: string,
  formData: FormData,
): Promise<UpdateStatusActionResult> {
  // Role gate first — never read or write before this.
  const auth = await assertRole(["owner", "admin"]);
  if (!auth.ok) {
    return { ok: false, error: auth.reason === "signin" ? "Not signed in." : "Forbidden." };
  }

  const newStatus = String(formData.get("new_status") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!(ALL_STATUSES as string[]).includes(newStatus)) {
    return { ok: false, error: "Invalid status value." };
  }

  const result = await updateLeadStatus({
    lead_id: leadId,
    new_status: newStatus as LeadStatus,
    actor_user_id: auth.session.user_id,
    note,
  });

  if (!result.ok) return { ok: false, error: result.message };

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { ok: true, old_status: result.old_status, new_status: result.new_status };
}
