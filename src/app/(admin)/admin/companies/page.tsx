import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { listCompaniesForAdmin, type AdminCompanyListRow } from "@/lib/admin/companies/list";
import {
  ENTITY_STATUSES,
  PUBLIC_STATUSES,
  type EntityStatus,
  type PublicStatus,
} from "@/lib/admin/companies/validate";

export const dynamic = "force-dynamic";

function fmtRiyadh(ts: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(ts));
}

export default async function CompaniesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; public_status?: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const params = await searchParams;

  const statusFilter = (ENTITY_STATUSES as string[]).includes(params.status ?? "")
    ? (params.status as EntityStatus)
    : null;
  const publicFilter = (PUBLIC_STATUSES as string[]).includes(params.public_status ?? "")
    ? (params.public_status as PublicStatus)
    : null;

  const companies = await listCompaniesForAdmin({ status: statusFilter, public_status: publicFilter });
  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <div className="admin-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Companies <span className="admin-section-tag">{statusFilter ?? "all"}{publicFilter ? ` · ${publicFilter}` : ""}</span></h1>
          <div className="sub">
            {companies.length === 0
              ? "No companies match this filter."
              : `Showing ${companies.length} compan${companies.length === 1 ? "y" : "ies"}.`}
          </div>
        </div>
        {canEdit && (
          <Link href="/admin/companies/new" className="admin-btn admin-btn--primary" style={{ textDecoration: "none" }}>
            + New company
          </Link>
        )}
      </div>

      <form className="admin-filter-bar" method="get">
        <div className="field">
          <label htmlFor="cf-status">Status</label>
          <select id="cf-status" name="status" className="admin-select" defaultValue={statusFilter ?? ""}>
            <option value="">All</option>
            {ENTITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cf-public">Public status</label>
          <select id="cf-public" name="public_status" className="admin-select" defaultValue={publicFilter ?? ""}>
            <option value="">All</option>
            {PUBLIC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className="admin-btn admin-btn--secondary">Filter</button>
        {(statusFilter || publicFilter) && (
          <Link href="/admin/companies" className="admin-link-clear">Clear</Link>
        )}
      </form>

      {companies.length === 0 ? (
        <div className="admin-empty">
          <div className="icon">📭</div>
          <div>No companies match this filter.</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Trust level</th>
                  <th>Public</th>
                  <th>Status</th>
                  <th className="col-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c: AdminCompanyListRow) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/companies/${c.id}`} className="lead-link" style={{ fontFamily: "inherit" }}>
                        {c.name_ar}
                      </Link>
                      <div style={{ fontSize: ".78rem", color: "#6B7280" }}>{c.name_en}</div>
                    </td>
                    <td className="admin-mono" style={{ fontSize: ".82rem" }}>{c.slug}</td>
                    <td style={{ fontSize: ".82rem", color: "#6B7280" }}>{c.trust_level.replace(/_/g, " ")}</td>
                    <td><span className={`admin-badge admin-badge--${c.public_status === "published" ? "closed_won" : c.public_status === "blocked" ? "closed_lost" : "spam"}`}>{c.public_status}</span></td>
                    <td><span className={`admin-badge admin-badge--${c.status === "active" ? "closed_won" : c.status === "archived" ? "closed_lost" : "spam"}`}>{c.status}</span></td>
                    <td className="col-right">{fmtRiyadh(c.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
