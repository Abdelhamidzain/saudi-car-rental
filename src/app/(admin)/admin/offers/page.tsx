import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { listOffersForAdmin, type AdminOfferListRow } from "@/lib/admin/offers/list";
import { listCompaniesForAdmin } from "@/lib/admin/companies/list";
import {
  APPROVAL_STATUSES,
  OFFER_PUBLIC_STATUSES,
  type ApprovalStatus,
  type OfferPublicStatus,
} from "@/lib/admin/offers/validate";

export const dynamic = "force-dynamic";

function fmtRiyadh(ts: string | null): string {
  if (!ts) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(ts));
}

const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
function isStale(ts: string | null): boolean {
  if (!ts) return true;
  return Date.now() - new Date(ts).getTime() > STALE_AFTER_MS;
}

function approvalBadge(s: ApprovalStatus): string {
  return s === "approved" || s === "auto_approved" ? "closed_won" : s === "rejected" ? "closed_lost" : "reviewed";
}
function publicBadge(s: OfferPublicStatus): string {
  return s === "published" ? "closed_won" : s === "blocked" ? "closed_lost" : "spam";
}
function statusBadge(s: "active" | "inactive" | "archived"): string {
  return s === "active" ? "closed_won" : s === "archived" ? "closed_lost" : "spam";
}

export default async function OffersListPage({
  searchParams,
}: {
  searchParams: Promise<{ approval_status?: string; public_status?: string; company_id?: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const params = await searchParams;

  const approvalFilter = (APPROVAL_STATUSES as string[]).includes(params.approval_status ?? "")
    ? (params.approval_status as ApprovalStatus)
    : null;
  const publicFilter = (OFFER_PUBLIC_STATUSES as string[]).includes(params.public_status ?? "")
    ? (params.public_status as OfferPublicStatus)
    : null;
  const companyFilter = params.company_id && /^[0-9a-f-]{36}$/i.test(params.company_id) ? params.company_id : null;

  const [offers, companies] = await Promise.all([
    listOffersForAdmin({ approval_status: approvalFilter, public_status: publicFilter, company_id: companyFilter }),
    listCompaniesForAdmin({}),
  ]);

  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <div className="admin-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Offers <span className="admin-section-tag">{approvalFilter ?? "all"}{publicFilter ? ` · ${publicFilter}` : ""}</span></h1>
          <div className="sub">
            {offers.length === 0 ? "No offers match this filter." : `Showing ${offers.length} offer${offers.length === 1 ? "" : "s"}.`}
          </div>
        </div>
        {canEdit && (
          <Link href="/admin/offers/new" className="admin-btn admin-btn--primary" style={{ textDecoration: "none" }}>
            + New offer
          </Link>
        )}
      </div>

      <form className="admin-filter-bar" method="get">
        <div className="field">
          <label htmlFor="of-approval">Approval</label>
          <select id="of-approval" name="approval_status" className="admin-select" defaultValue={approvalFilter ?? ""}>
            <option value="">All</option>
            {APPROVAL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="of-pub">Public</label>
          <select id="of-pub" name="public_status" className="admin-select" defaultValue={publicFilter ?? ""}>
            <option value="">All</option>
            {OFFER_PUBLIC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="of-co">Company</label>
          <select id="of-co" name="company_id" className="admin-select" defaultValue={companyFilter ?? ""}>
            <option value="">All</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
          </select>
        </div>
        <button type="submit" className="admin-btn admin-btn--secondary">Filter</button>
        {(approvalFilter || publicFilter || companyFilter) && (
          <Link href="/admin/offers" className="admin-link-clear">Clear</Link>
        )}
      </form>

      {offers.length === 0 ? (
        <div className="admin-empty"><div className="icon">💸</div><div>No offers match this filter.</div></div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Company</th>
                  <th>Branch · City</th>
                  <th>Daily</th>
                  <th>Avail.</th>
                  <th>Approval</th>
                  <th>Public</th>
                  <th>Status</th>
                  <th className="col-right">Price updated</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o: AdminOfferListRow) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/offers/${o.id}`} className="lead-link" style={{ fontFamily: "inherit" }}>
                        {o.car?.brand_ar ?? "—"} {o.car?.model_ar ?? ""}
                      </Link>
                      <div style={{ fontSize: ".78rem", color: "#6B7280" }}>{o.car?.year ?? ""}</div>
                    </td>
                    <td style={{ fontSize: ".88rem" }}>{o.company?.name_ar ?? "—"}</td>
                    <td style={{ fontSize: ".82rem", color: "#6B7280" }}>
                      {o.branch?.district ?? o.branch?.address_ar ?? "—"}
                      {o.city?.name_ar ? ` · ${o.city.name_ar}` : ""}
                    </td>
                    <td className="admin-mono" style={{ fontSize: ".88rem" }}>
                      {o.daily_price_from != null ? `${o.daily_price_from} SAR` : "—"}
                    </td>
                    <td style={{ fontSize: ".82rem", color: "#6B7280" }}>{o.availability_status.replace(/_/g, " ")}</td>
                    <td><span className={`admin-badge admin-badge--${approvalBadge(o.approval_status)}`}>{o.approval_status.replace(/_/g, " ")}</span></td>
                    <td><span className={`admin-badge admin-badge--${publicBadge(o.public_status)}`}>{o.public_status}</span></td>
                    <td><span className={`admin-badge admin-badge--${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td className="col-right" style={{ color: isStale(o.last_updated_at) ? "#991B1B" : "#6B7280" }}>
                      {fmtRiyadh(o.last_updated_at)}{isStale(o.last_updated_at) ? " ⚠" : ""}
                    </td>
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
