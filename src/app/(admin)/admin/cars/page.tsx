import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { listCarsForAdmin, type AdminCarListRow } from "@/lib/admin/cars/list";
import { ENTITY_STATUSES, type CarEntityStatus } from "@/lib/admin/cars/validate";

export const dynamic = "force-dynamic";

function fmtRiyadh(ts: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(ts));
}

function statusBadgeClass(s: CarEntityStatus): string {
  return s === "active" ? "closed_won" : s === "archived" ? "closed_lost" : "spam";
}

export default async function CarsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const params = await searchParams;

  const statusFilter = (ENTITY_STATUSES as string[]).includes(params.status ?? "")
    ? (params.status as CarEntityStatus)
    : null;

  const cars = await listCarsForAdmin({ status: statusFilter });
  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <div className="admin-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Cars <span className="admin-section-tag">{statusFilter ?? "all"}</span></h1>
          <div className="sub">
            {cars.length === 0
              ? "No cars match this filter."
              : `Showing ${cars.length} car${cars.length === 1 ? "" : "s"}.`}
          </div>
        </div>
        {canEdit && (
          <Link href="/admin/cars/new" className="admin-btn admin-btn--primary" style={{ textDecoration: "none" }}>
            + New car
          </Link>
        )}
      </div>

      <form className="admin-filter-bar" method="get">
        <div className="field">
          <label htmlFor="cars-status">Status</label>
          <select id="cars-status" name="status" className="admin-select" defaultValue={statusFilter ?? ""}>
            <option value="">All</option>
            {ENTITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className="admin-btn admin-btn--secondary">Filter</button>
        {statusFilter && (
          <Link href="/admin/cars" className="admin-link-clear">Clear</Link>
        )}
      </form>

      {cars.length === 0 ? (
        <div className="admin-empty">
          <div className="icon">🚗</div>
          <div>No cars match this filter.</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Brand / Model</th>
                  <th>Slug</th>
                  <th>Year</th>
                  <th>Category</th>
                  <th>Trans.</th>
                  <th>Seats</th>
                  <th>Fuel</th>
                  <th>Status</th>
                  <th className="col-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((c: AdminCarListRow) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/cars/${c.id}`} className="lead-link" style={{ fontFamily: "inherit" }}>
                        {c.brand_ar} {c.model_ar}
                      </Link>
                      <div style={{ fontSize: ".78rem", color: "#6B7280" }}>
                        {c.brand} {c.model}{c.year ? ` · ${c.year}` : ""}
                      </div>
                    </td>
                    <td className="admin-mono" style={{ fontSize: ".82rem" }}>{c.slug}</td>
                    <td style={{ fontSize: ".82rem", color: "#6B7280" }}>{c.year ?? "—"}</td>
                    <td style={{ fontSize: ".82rem" }}>{c.category?.name_ar ?? "—"}</td>
                    <td style={{ fontSize: ".82rem", color: "#6B7280" }}>{c.transmission ?? "—"}</td>
                    <td style={{ fontSize: ".82rem", color: "#6B7280" }}>{c.seats ?? "—"}</td>
                    <td style={{ fontSize: ".82rem", color: "#6B7280" }}>{c.fuel_type ?? "—"}</td>
                    <td><span className={`admin-badge admin-badge--${statusBadgeClass(c.status)}`}>{c.status}</span></td>
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
