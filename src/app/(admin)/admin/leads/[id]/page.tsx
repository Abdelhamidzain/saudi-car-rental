import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getLeadById, getLeadActivityLog } from "@/lib/admin/leads/get-lead";
import { StatusForm } from "./status-form";

export const dynamic = "force-dynamic";

function fmtRiyadh(ts: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date(ts));
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const { id } = await params;

  const lead = await getLeadById(id);
  if (!lead) notFound();

  const log = await getLeadActivityLog(id);
  const canEdit = session.role === "owner" || session.role === "admin";
  const utmLine = [
    lead.utm_source && `source=${lead.utm_source}`,
    lead.utm_medium && `medium=${lead.utm_medium}`,
    lead.utm_campaign && `campaign=${lead.utm_campaign}`,
    lead.utm_content && `content=${lead.utm_content}`,
    lead.utm_term && `term=${lead.utm_term}`,
  ].filter(Boolean).join(" · ") || "—";

  return (
    <>
      <Link href="/admin/leads" className="admin-back-link">← All leads</Link>

      <div className="admin-detail-head">
        <h1>{lead.lead_number ?? lead.id.slice(0, 8)}</h1>
        <span className={`admin-badge admin-badge--lg admin-badge--${lead.status}`}>{lead.status.replace(/_/g, " ")}</span>
      </div>

      <div className="admin-two-col">
        <div>
          <div className="admin-card">
            <h2><span className="admin-section-tag">Details</span></h2>
            <dl className="admin-dl">
              <dt>Customer phone</dt><dd className="admin-mono">{lead.customer_phone}</dd>
              <dt>Customer name</dt><dd>{lead.customer_name ?? "—"}</dd>
              <dt>City</dt><dd>{lead.city?.name_ar ?? "—"}</dd>
              <dt>Category</dt><dd>{lead.category?.name_ar ?? "—"}</dd>
              <dt>Selected car</dt><dd>{lead.selected_car ? `${lead.selected_car.brand_ar} ${lead.selected_car.model_ar}` : "—"}</dd>
              <dt>Airport</dt><dd>{lead.airport ? `${lead.airport.name_ar} (${lead.airport.code})` : "—"}</dd>
              <dt>Request type</dt><dd>{lead.request_type.replace(/_/g, " ")}</dd>
              <dt>Pickup</dt><dd className="admin-mono">{lead.pickup_date}</dd>
              <dt>Return</dt><dd className="admin-mono">{lead.return_date}</dd>
              <dt>Rental days</dt><dd>{lead.rental_days}</dd>
              <dt>Pickup location</dt><dd>{lead.pickup_location ?? "—"}</dd>
              <dt>Source page</dt><dd className="admin-mono" style={{ wordBreak: "break-all" }}>{lead.source_page ?? "—"}</dd>
              <dt>UTMs</dt><dd style={{ fontSize: "0.85rem" }}>{utmLine}</dd>
              <dt>Consent</dt>
              <dd style={{ fontSize: "0.85rem", color: "#374151" }}>
                <span style={{ fontWeight: 600, color: lead.consent_accepted ? "#065F46" : "#991B1B" }}>
                  {lead.consent_accepted ? "accepted" : "NOT accepted"}
                </span>{" "}
                · version <code className="admin-mono">{lead.consent_text_version}</code>
                <br/>
                <span style={{ color: "#6B7280" }}>
                  at {fmtRiyadh(lead.consent_accepted_at)}{lead.consent_ip ? ` from ${lead.consent_ip}` : ""}
                </span>
              </dd>
              <dt>Created</dt><dd>{fmtRiyadh(lead.created_at)}</dd>
              <dt>Updated</dt><dd>{fmtRiyadh(lead.updated_at)}</dd>
            </dl>
          </div>
        </div>

        <div>
          <div className="admin-card">
            <h2><span className="admin-section-tag">Change status</span></h2>
            <StatusForm leadId={lead.id} currentStatus={lead.status} canEdit={canEdit} />
          </div>

          <div className="admin-card">
            <h2><span className="admin-section-tag">Activity log</span></h2>
            {log.length === 0 ? (
              <div className="admin-empty" style={{ padding: "20px 16px" }}>
                <div>No activity recorded.</div>
              </div>
            ) : (
              <ul className="admin-timeline">
                {log.map(entry => (
                  <li key={entry.id}>
                    <div className="ev-title">{entry.title}</div>
                    {entry.description && <div className="ev-desc">{entry.description}</div>}
                    {(entry.old_value || entry.new_value) && (
                      <div className="ev-change">
                        {entry.old_value ?? "—"} → {entry.new_value ?? "—"}
                      </div>
                    )}
                    <div className="ev-meta">
                      {entry.event_type} · {entry.actor_type}
                      {entry.actor_id ? ` (${entry.actor_id.slice(0, 8)})` : ""}
                      {" · "}{fmtRiyadh(entry.created_at)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
