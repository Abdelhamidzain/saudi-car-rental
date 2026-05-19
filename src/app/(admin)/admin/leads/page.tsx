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
      <h1>Leads</h1>

      <form className="admin-filter-bar" method="get">
        <div>
          <label htmlFor="filter-status" style={{ fontSize: ".8rem", color: "#6B7280", display: "block", marginBottom: 4 }}>Status</label>
          <select id="filter-status" name="status" defaultValue={statusFilter ?? ""}>
            <option value="">All</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" style={{ padding: "6px 14px", fontSize: ".85rem", background: "#1B3A5C", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Filter
        </button>
        {statusFilter && (
          <Link href="/admin/leads" style={{ fontSize: ".85rem", color: "#6B7280" }}>
            Clear
          </Link>
        )}
      </form>

      {leads.length === 0 ? (
        <p style={{ color: "#6B7280", fontSize: ".9rem", padding: 12 }}>No leads match this filter.</p>
      ) : (
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
              <th>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td><Link href={`/admin/leads/${lead.id}`}>{lead.lead_number ?? lead.id.slice(0, 8)}</Link></td>
                <td>{formatRiyadh(lead.created_at)}</td>
                <td style={{ fontFamily: "ui-monospace, monospace" }}>{lead.customer_phone}</td>
                <td>{lead.city?.name_ar ?? "—"}</td>
                <td>{lead.category?.name_ar ?? "—"}</td>
                <td>{lead.request_type}</td>
                <td><span className={`admin-badge admin-badge--${lead.status}`}>{lead.status.replace(/_/g, " ")}</span></td>
                <td>{formatRiyadh(lead.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ color: "#9CA3AF", fontSize: ".75rem", marginTop: 12 }}>
        Showing latest 50. Pagination coming in a later task.
      </p>
    </>
  );
}
