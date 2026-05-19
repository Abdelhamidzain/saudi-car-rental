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

function statusLabel(status: AdminLeadRoutingRow["company_response_status"]): string {
  return status.replace(/_/g, " ");
}

export function RoutingPanel(props: RoutingPanelProps) {
  const { leadId, canEdit, messageContext, companies, branchesByCompany, routings } = props;

  // ─── Assignment form state ─────────────────────────────────────────────
  const [companyId, setCompanyId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assigning, startAssign] = useTransition();

  const selectedCompany = companies.find(c => c.id === companyId) ?? null;
  const branchesForSelected = companyId ? (branchesByCompany[companyId] ?? []) : [];
  const selectedBranch = branchesForSelected.find(b => b.id === branchId) ?? null;

  // Live preview of the message for the currently-picked company/branch.
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
        setAssignSuccess("New routing entry created. The lead's current assignment now points to it.");
        setCompanyId("");
        setBranchId("");
      }
    });
  }

  // Split routings into "current" (most recent) and "previous".
  const currentRouting = routings[0] ?? null;
  const previousRoutings = routings.slice(1);
  const hasAnyRouting = routings.length > 0;

  return (
    <>
      {/* ── Assign / Reassign card ─────────────────────────────────────── */}
      <div className="admin-card">
        <h2><span className="admin-section-tag">{hasAnyRouting ? "Reassign" : "Assign"}</span></h2>

        {hasAnyRouting && (
          <div className="admin-notice" style={{ marginBottom: 14 }}>
            This lead already has {routings.length} routing{routings.length === 1 ? "" : "s"}. You can assign to another
            company below — a new routing row will be created and the lead&apos;s current assignment pointer will move to
            it. Previous routings stay below as history.
          </div>
        )}

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
            {assigning ? "Assigning…" : (hasAnyRouting ? "Reassign to this company" : "Assign to company")}
          </button>
        </div>

        {/* Live message preview */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: ".02em" }}>
            WhatsApp message preview
          </div>
          <pre dir="rtl" lang="ar" className="admin-msg-pre">
            {previewMessage}
          </pre>
        </div>
      </div>

      {/* ── Current routing ────────────────────────────────────────────── */}
      {currentRouting && (
        <div className="admin-card admin-card--current">
          <h2>
            <span className="admin-section-tag admin-section-tag--current">Current routing</span>
          </h2>
          <RoutingCard
            routing={currentRouting}
            leadId={leadId}
            canEdit={canEdit}
            messageContext={messageContext}
            isCurrent
          />
        </div>
      )}

      {/* ── Previous routings ──────────────────────────────────────────── */}
      {previousRoutings.length > 0 && (
        <div className="admin-card">
          <h2><span className="admin-section-tag">Previous routings ({previousRoutings.length})</span></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {previousRoutings.map(r => (
              <RoutingCard
                key={r.id}
                routing={r}
                leadId={leadId}
                canEdit={canEdit}
                messageContext={messageContext}
                isCurrent={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {!hasAnyRouting && (
        <div className="admin-card">
          <div className="admin-empty" style={{ padding: "20px 16px" }}>
            <div className="icon">📭</div>
            <div>No routings yet. Use the form above to assign this lead to a company.</div>
          </div>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Inner component: one routing row, with Copy / Open WhatsApp / Mark sent.
// ──────────────────────────────────────────────────────────────────────────

function RoutingCard({
  routing,
  leadId,
  canEdit,
  messageContext,
  isCurrent,
}: {
  routing: AdminLeadRoutingRow;
  leadId: string;
  canEdit: boolean;
  messageContext: BuildWhatsAppMessageInput;
  isCurrent: boolean;
}) {
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [sentError, setSentError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [actPending, startAction] = useTransition();

  const isSent = routing.company_response_status !== "not_sent";

  // Fallback: if the routing's snapshotted generated_message is empty (could
  // happen for legacy rows), regenerate one from the live lead context plus
  // the routing's joined company/branch labels.
  const message = useMemo(() => {
    const snap = routing.generated_message?.trim();
    if (snap) return snap;
    return buildWhatsAppMessage({
      ...messageContext,
      company_name_ar: routing.company?.name_ar ?? null,
      branch_label: routing.branch?.district ?? routing.branch?.address_ar ?? null,
    });
  }, [routing, messageContext]);

  const deepLink = buildWhatsAppDeepLink(routing.whatsapp_number, message);

  async function onCopy() {
    setCopyError(null); setCopySuccess(null);
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      setCopyError("Clipboard blocked. Select the message text below and copy manually.");
      return;
    }
    startAction(async () => {
      const result = await recordRoutingEventAction(leadId, routing.id, "whatsapp_copied");
      if (!result.ok) setCopyError(result.error);
      else setCopySuccess("Copied. Activity logged.");
    });
  }

  // Logs the open event but does NOT prevent the link's default behaviour.
  // The browser opens the wa.me URL in a new tab via the <a> element; the
  // server action fires-and-forgets in the original tab.
  function onOpenClick() {
    if (!canEdit) return;
    startAction(async () => {
      await recordRoutingEventAction(leadId, routing.id, "whatsapp_opened");
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
    <div className={`admin-routing-row ${isCurrent ? "admin-routing-row--current" : ""}`}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        <div style={{ fontWeight: 700, color: "#1A1A2E" }}>
          {isCurrent && <span style={{ color: "#1A7A42", marginInlineEnd: 6 }} aria-hidden="true">●</span>}
          {routing.company?.name_ar ?? "—"}
          {(routing.branch?.district || routing.branch?.address_ar) && (
            <span style={{ color: "#6B7280", fontWeight: 500, fontSize: ".85rem" }}>
              {" "}· {routing.branch?.district ?? routing.branch?.address_ar}
            </span>
          )}
        </div>
        <span className={`admin-badge admin-badge--${isSent ? "sent_to_company" : "new"}`}>
          {statusLabel(routing.company_response_status)}
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
        <pre dir="rtl" lang="ar" className="admin-msg-pre" style={{ marginTop: 8 }}>
          {message}
        </pre>
      </details>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          disabled={!canEdit || actPending || !message}
          onClick={onCopy}
        >
          Copy message
        </button>

        {deepLink ? (
          <a
            href={deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--secondary"
            onClick={onOpenClick}
            style={{ textDecoration: "none" }}
            aria-disabled={!canEdit || actPending}
          >
            Open WhatsApp
          </a>
        ) : (
          <button type="button" className="admin-btn admin-btn--secondary" disabled>
            Open WhatsApp
          </button>
        )}
      </div>

      {!deepLink && (
        <div className="admin-notice" style={{ marginBottom: 8 }}>
          No WhatsApp number available for this branch. Use <strong>Copy message</strong> and paste it into WhatsApp manually.
        </div>
      )}
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
