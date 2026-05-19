"use client";

import { useState, useTransition } from "react";
import { updateStatusAction } from "./actions";
import type { LeadStatus } from "@/lib/admin/leads/list-leads";

const ALL_STATUSES: LeadStatus[] = [
  "new", "reviewed", "sent_to_company", "company_replied", "customer_contacted",
  "closed_won", "closed_lost", "spam", "duplicate",
];

export function StatusForm({
  leadId,
  currentStatus,
  canEdit,
}: {
  leadId: string;
  currentStatus: LeadStatus;
  canEdit: boolean;
}) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateStatusAction(leadId, formData);
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(`Status: ${result.old_status} → ${result.new_status}`);
      }
    });
  }

  return (
    <form className="admin-form" action={onSubmit}>
      <div>
        <label htmlFor="new-status">New status</label>
        <select
          id="new-status"
          name="new_status"
          value={status}
          onChange={e => setStatus(e.target.value as LeadStatus)}
          disabled={!canEdit || pending}
        >
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="status-note">Note (optional)</label>
        <textarea id="status-note" name="note" rows={2} disabled={!canEdit || pending} placeholder="Reason or context for this change" />
      </div>
      {!canEdit && <div className="admin-notice">Your role does not have permission to change status.</div>}
      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}
      <button type="submit" disabled={!canEdit || pending}>
        {pending ? "Updating…" : "Update status"}
      </button>
    </form>
  );
}
