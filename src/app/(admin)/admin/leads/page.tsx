import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { listLeads, type LeadStatus } from "@/lib/admin/leads/list-leads";

export const dynamic = "force-dynamic";

const STATUSES: LeadStatus[] = [
  "new", "reviewed", "sent_to_company", "company_replied", "customer_contacted",
  "closed_won", "closed_lost", "spam", "duplicate",
];

function formatRiyadh(ts: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(ts));
}

export default async function LeadsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["owner", "admin", "editor"]);

  const params = await searchParams;
  const statusFilter =
    params.status && (STATUSES as string[]).includes(params.status)
      ? (params.status as LeadStatus)
      : null;

  const leads = await listLeads({ status: statusFilter });

  return (
    <>
      <div className="admin-page-head">
        <h1>Leads <span className="admin-section-tag">{statusFilter ?? "all"}</span></h1>
        <div className="sub">
          {leads.length === 0
            ? "No leads to display."
            : `Showing ${leads.length} ${leads.length === 1 ? "lead" : "leads"} (latest first, capped at 50).`}
        </div>
      </div>

      <form className="admin-filter-bar" method="get">
        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" name="status" defaultValue={statusFilter ?? ""} className="admin-select">
            <option value="">All</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <button type="submit" className="admin-btn admin-btn--secondary">Filter</button>
        {statusFilter && (
          <Link href="/admin/leads" className="admin-link-clear">Clear</Link>
        )}
      </form>

      {leads.length === 0 ? (
        <div className="admin-empty">
          <div className="icon">📭</div>
          <div>No leads match this filter.</div>
          {statusFilter && (
            <div style={{ marginTop: 8 }}>
              <Link href="/admin/leads" className="admin-link-clear">Clear filter</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lead #</th>
                  <th>Created</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="col-right">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <Link className="lead-link" href={`/admin/leads/${lead.id}`}>
                        {lead.lead_number ?? lead.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td style={{ color: "#6B7280", fontSize: "0.82rem" }}>{formatRiyadh(lead.created_at)}</td>
                    <td className="admin-mono">{lead.customer_phone}</td>
                    <td>{lead.city?.name_ar ?? "—"}</td>
                    <td>{lead.category?.name_ar ?? "—"}</td>
                    <td style={{ color: "#6B7280", fontSize: "0.82rem" }}>{lead.request_type.replace(/_/g, " ")}</td>
                    <td><span className={`admin-badge admin-badge--${lead.status}`}>{lead.status.replace(/_/g, " ")}</span></td>
                    <td className="col-right">{formatRiyadh(lead.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-table-foot">
            Showing latest 50 leads. Pagination coming in a later task.
          </div>
        </div>
      )}
    </>
  );
}
