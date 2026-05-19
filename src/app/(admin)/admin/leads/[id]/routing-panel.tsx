"use client";

import { useMemo, useState, useTransition } from "react";
import { assignLeadAction, markRoutingSentAction, recordRoutingEventAction } from "./routing-actions";
import {
  buildWhatsAppMessage,
  buildWhatsAppDeepLink,
  type BuildWhatsAppMessageInput,
} from "@/lib/admin/routing/whatsapp-message";
import type { AdminCompanyOption } from "@/lib/admin/routing/list-companies";
import type { AdminBranchOption } from "@/lib/admin/routing/list-branches";
import type { AdminLeadRoutingRow } from "@/lib/admin/routing/list-routings";

type RoutingPanelProps = {
  leadId: string;
  canEdit: boolean;
  messageContext: BuildWhatsAppMessageInput; // pre-filled from server
  companies: AdminCompanyOption[];
  branchesByCompany: Record<string, AdminBranchOption[]>;
  routings: AdminLeadRoutingRow[];
};

function fmtRiyadh(ts: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(ts));
}

function branchLabel(b: AdminBranchOption): string {
  const main = b.is_main_branch ? "★ " : "";
  const place = b.district ?? b.address_ar ?? "Branch";
  const city = b.city?.name_ar ? ` — ${b.city.name_ar}` : "";
  return `${main}${place}${city}`;
}

function statusBadge(status: AdminLeadRoutingRow["company_response_status"]): string {
  return status.replace(/_/g, " ");
}

export function RoutingPanel(props: RoutingPanelProps) {
  const { leadId, canEdit, messageContext, companies, branchesByCompany, routings } = props;

  // ─── New assignment form state ─────────────────────────────────────────
  const [companyId, setCompanyId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assigning, startAssign] = useTransition();

  const selectedCompany = companies.find(c => c.id === companyId) ?? null;
  const branchesForSelected = companyId ? (branchesByCompany[companyId] ?? []) : [];
  const selectedBranch = branchesForSelected.find(b => b.id === branchId) ?? null;

  // Build the preview message live from current selections.
  const previewMessage = useMemo(() => {
    return buildWhatsAppMessage({
      ...messageContext,
      company_name_ar: selectedCompany?.name_ar ?? null,
      branch_label: selectedBranch ? (selectedBranch.district ?? selectedBranch.address_ar ?? null) : null,
    });
  }, [messageContext, selectedCompany, selectedBranch]);

  function onAssignSubmit() {
    setAssignError(null);
    setAssignSuccess(null);
    if (!companyId) {
      setAssignError("Pick a company first.");
      return;
    }
    const whatsapp = selectedBranch?.whatsapp_number ?? null;
    startAssign(async () => {
      const result = await assignLeadAction({
        lead_id: leadId,
        company_id: companyId,
        branch_id: branchId || null,
        whatsapp_number: whatsapp,
        generated_message: previewMessage,
      });
      if (!result.ok) {
        setAssignError(result.error);
      } else {
        setAssignSuccess("Assigned. A new routing entry has been created below.");
        // Reset the picker so a follow-up assignment starts fresh.
        setCompanyId("");
        setBranchId("");
      }
    });
  }

  return (
    <>
      {/* ── New assignment card ────────────────────────────────────────── */}
      <div className="admin-card">
        <h2><span className="admin-section-tag">Routing</span></h2>

        <div className="admin-form">
          <div className="field">
            <label htmlFor="route-company">Company</label>
            <select
              id="route-company"
              className="admin-select"
              value={companyId}
              onChange={e => { setCompanyId(e.target.value); setBranchId(""); }}
              disabled={!canEdit || assigning}
            >
              <option value="">— select company —</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name_ar} ({c.name_en})</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="route-branch">Branch</label>
            <select
              id="route-branch"
              className="admin-select"
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              disabled={!canEdit || assigning || !companyId}
            >
              <option value="">— select branch (optional) —</option>
              {branchesForSelected.map(b => (
                <option key={b.id} value={b.id}>
                  {branchLabel(b)}{b.whatsapp_number ? ` · ${b.whatsapp_number}` : " · no WhatsApp"}
                </option>
              ))}
            </select>
            {companyId && branchesForSelected.length === 0 && (
              <div style={{ fontSize: ".8rem", color: "#6B7280", marginTop: 4 }}>
                This company has no active branches.
              </div>
            )}
          </div>

          {!canEdit && <div className="admin-notice">Your role does not permit assignments.</div>}
          {assignError && <div className="admin-error">{assignError}</div>}
          {assignSuccess && <div className="admin-success">{assignSuccess}</div>}

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={!canEdit || assigning || !companyId}
            onClick={onAssignSubmit}
          >
            {assigning ? "Assigning…" : "Assign to company"}
          </button>
        </div>

        {/* Live message preview */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: ".02em" }}>
            WhatsApp message preview
          </div>
          <pre
            dir="rtl"
            lang="ar"
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              background: "#FAFAF7",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: 14,
              fontFamily: "var(--font-tajawal), 'Tajawal', sans-serif",
              fontSize: ".88rem",
              lineHeight: 1.8,
              color: "#1A1A2E",
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {previewMessage}
          </pre>
        </div>
      </div>

      {/* ── Existing routings ──────────────────────────────────────────── */}
      <div className="admin-card">
        <h2><span className="admin-section-tag">Routings ({routings.length})</span></h2>
        {routings.length === 0 ? (
          <div className="admin-empty" style={{ padding: "20px 16px" }}>
            <div>No routings yet. Assign a company above to start.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {routings.map(r => (
              <RoutingCard
                key={r.id}
                routing={r}
                leadId={leadId}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ─── Inner component for one routing row ────────────────────────────
  function RoutingCard({ routing, leadId, canEdit }: { routing: AdminLeadRoutingRow; leadId: string; canEdit: boolean }) {
    const [copyError, setCopyError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [sentError, setSentError] = useState<string | null>(null);
    const [sentSuccess, setSentSuccess] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [actPending, startAction] = useTransition();

    const isSent = routing.company_response_status !== "not_sent";
    const message = routing.generated_message ?? "";
    const deepLink = buildWhatsAppDeepLink(routing.whatsapp_number, message);

    async function onCopy() {
      setCopyError(null); setCopySuccess(null);
      try {
        await navigator.clipboard.writeText(message);
      } catch {
        setCopyError("Clipboard blocked. Select the message and copy manually.");
        return;
      }
      // Fire-and-log: record activity on the server.
      startAction(async () => {
        const result = await recordRoutingEventAction(leadId, routing.id, "whatsapp_copied");
        if (!result.ok) {
          setCopyError(result.error);
        } else {
          setCopySuccess("Copied. Activity logged.");
        }
      });
    }

    function onOpen() {
      setCopyError(null); setCopySuccess(null);
      if (!deepLink) {
        setCopyError("No WhatsApp number on the selected branch.");
        return;
      }
      // Open immediately so the click is in a user gesture, then log.
      window.open(deepLink, "_blank", "noopener,noreferrer");
      startAction(async () => {
        const result = await recordRoutingEventAction(leadId, routing.id, "whatsapp_opened");
        if (!result.ok) setCopyError(result.error);
      });
    }

    function onMarkSent(formData: FormData) {
      setSentError(null); setSentSuccess(null);
      startAction(async () => {
        const result = await markRoutingSentAction(routing.id, leadId, formData);
        if (!result.ok) {
          setSentError(result.error);
        } else {
          setSentSuccess(
            result.lead_status_changed
              ? `Marked as sent. Lead status now ${result.new_status}.`
              : "Marked as sent. Activity logged.",
          );
        }
      });
    }

    return (
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <div style={{ fontWeight: 700, color: "#1A1A2E" }}>
            {routing.company?.name_ar ?? "—"}{" "}
            {routing.branch?.district || routing.branch?.address_ar
              ? <span style={{ color: "#6B7280", fontWeight: 500, fontSize: ".85rem" }}>· {routing.branch?.district ?? routing.branch?.address_ar}</span>
              : null}
          </div>
          <span className={`admin-badge admin-badge--${isSent ? "sent_to_company" : "new"}`}>
            {statusBadge(routing.company_response_status)}
          </span>
        </div>

        <dl style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "4px 12px", fontSize: ".82rem", marginBottom: 12 }}>
          <dt style={{ color: "#6B7280" }}>WhatsApp</dt>
          <dd className="admin-mono">{routing.whatsapp_number ?? "—"}</dd>
          <dt style={{ color: "#6B7280" }}>Created</dt>
          <dd>{fmtRiyadh(routing.created_at)}</dd>
          {routing.sent_at && (
            <>
              <dt style={{ color: "#6B7280" }}>Sent</dt>
              <dd>{fmtRiyadh(routing.sent_at)}</dd>
            </>
          )}
        </dl>

        <details style={{ marginBottom: 12 }}>
          <summary style={{ fontSize: ".82rem", color: "#6B7280", cursor: "pointer" }}>Show message</summary>
          <pre
            dir="rtl"
            lang="ar"
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              background: "#FAFAF7",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: 12,
              fontFamily: "var(--font-tajawal), 'Tajawal', sans-serif",
              fontSize: ".85rem",
              lineHeight: 1.7,
              marginTop: 8,
              color: "#1A1A2E",
            }}
          >
            {message}
          </pre>
        </details>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            disabled={!canEdit || actPending || !message}
            onClick={onCopy}
          >
            Copy message
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            disabled={!canEdit || actPending || !deepLink}
            onClick={onOpen}
            title={deepLink ? undefined : "No WhatsApp number on this routing"}
          >
            Open WhatsApp
          </button>
        </div>
        {copyError && <div className="admin-error" style={{ marginBottom: 8 }}>{copyError}</div>}
        {copySuccess && <div className="admin-success" style={{ marginBottom: 8 }}>{copySuccess}</div>}

        {!isSent && (
          <form action={onMarkSent} className="admin-form" style={{ marginTop: 8 }}>
            <div className="field">
              <label htmlFor={`sent-note-${routing.id}`}>Note (optional)</label>
              <textarea
                id={`sent-note-${routing.id}`}
                name="note"
                rows={2}
                disabled={!canEdit || actPending}
                placeholder="e.g. sent via WhatsApp Web"
                className="admin-textarea"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={!canEdit || actPending}
            >
              {actPending ? "Saving…" : "Mark as sent"}
            </button>
            {sentError && <div className="admin-error">{sentError}</div>}
            {sentSuccess && <div className="admin-success">{sentSuccess}</div>}
          </form>
        )}
      </div>
    );
  }
}
