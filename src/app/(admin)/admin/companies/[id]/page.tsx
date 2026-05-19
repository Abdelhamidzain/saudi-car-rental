import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getCompanyById } from "@/lib/admin/companies/get";
import { listBranchesForCompanyForAdmin } from "@/lib/admin/branches/list-for-company";
import { CompanyForm } from "../company-form";

export const dynamic = "force-dynamic";

function fmtRiyadh(ts: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(ts));
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const { id } = await params;

  const [company, branches] = await Promise.all([
    getCompanyById(id),
    listBranchesForCompanyForAdmin(id),
  ]);

  if (!company) notFound();

  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <Link href="/admin/companies" className="admin-back-link">← All companies</Link>

      <div className="admin-detail-head">
        <h1 style={{ fontFamily: "var(--font-cairo), 'Cairo', 'Tajawal', sans-serif" }}>{company.name_ar}</h1>
        <span className={`admin-badge admin-badge--lg admin-badge--${company.status === "active" ? "closed_won" : company.status === "archived" ? "closed_lost" : "spam"}`}>{company.status}</span>
      </div>

      <div className="admin-two-col">
        <div>
          <div className="admin-card">
            <h2><span className="admin-section-tag">Edit company</span></h2>
            <CompanyForm
              mode="edit"
              canEdit={canEdit}
              initial={{
                id: company.id,
                name_ar: company.name_ar,
                name_en: company.name_en,
                slug: company.slug,
                logo_url: company.logo_url,
                website_url: company.website_url,
                google_maps_url: company.google_maps_url,
                trust_level: company.trust_level,
                public_status: company.public_status,
                status: company.status,
                internal_notes: company.internal_notes,
              }}
            />
          </div>
        </div>

        <div>
          <div className="admin-card">
            <h2><span className="admin-section-tag">Meta</span></h2>
            <dl className="admin-dl">
              <dt>ID</dt><dd className="admin-mono" style={{ fontSize: ".78rem", wordBreak: "break-all" }}>{company.id}</dd>
              <dt>Public status</dt><dd><span className={`admin-badge admin-badge--${company.public_status === "published" ? "closed_won" : company.public_status === "blocked" ? "closed_lost" : "spam"}`}>{company.public_status}</span></dd>
              <dt>Trust level</dt><dd>{company.trust_level.replace(/_/g, " ")}</dd>
              <dt>Created</dt><dd>{fmtRiyadh(company.created_at)}</dd>
              <dt>Updated</dt><dd>{fmtRiyadh(company.updated_at)}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ marginBottom: 0 }}><span className="admin-section-tag">Branches ({branches.length})</span></h2>
          {canEdit && (
            <Link href={`/admin/companies/${company.id}/branches/new`} className="admin-btn admin-btn--secondary" style={{ textDecoration: "none" }}>
              + New branch
            </Link>
          )}
        </div>

        {branches.length === 0 ? (
          <div className="admin-empty" style={{ padding: "20px 16px" }}>
            <div>No branches yet.</div>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>District / Address</th>
                    <th>City</th>
                    <th>WhatsApp</th>
                    <th>Phone</th>
                    <th>Main</th>
                    <th>Status</th>
                    <th className="col-right">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map(b => (
                    <tr key={b.id}>
                      <td>
                        <Link href={`/admin/companies/${company.id}/branches/${b.id}`} className="lead-link" style={{ fontFamily: "inherit" }}>
                          {b.district ?? b.address_ar ?? "—"}
                        </Link>
                      </td>
                      <td>{b.city?.name_ar ?? "—"}</td>
                      <td className="admin-mono" style={{ fontSize: ".82rem" }}>{b.whatsapp_number ?? "—"}</td>
                      <td className="admin-mono" style={{ fontSize: ".82rem" }}>{b.phone ?? "—"}</td>
                      <td>{b.is_main_branch ? "★" : ""}</td>
                      <td><span className={`admin-badge admin-badge--${b.status === "active" ? "closed_won" : b.status === "archived" ? "closed_lost" : "spam"}`}>{b.status}</span></td>
                      <td className="col-right">{fmtRiyadh(b.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
