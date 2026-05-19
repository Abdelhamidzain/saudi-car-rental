import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { CompanyForm } from "../company-form";

export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  const session = await requireRole(["owner", "admin", "editor"]);
  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <Link href="/admin/companies" className="admin-back-link">← All companies</Link>
      <div className="admin-page-head">
        <h1>New company</h1>
        <div className="sub">Create a rental partner. Use status + public status to control visibility.</div>
      </div>
      <div className="admin-card">
        <CompanyForm mode="create" canEdit={canEdit} />
      </div>
    </>
  );
}
