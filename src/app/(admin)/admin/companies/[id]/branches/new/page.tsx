import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getCompanyById } from "@/lib/admin/companies/get";
import { listActiveCities } from "@/lib/admin/cities/list";
import { BranchForm } from "../branch-form";

export const dynamic = "force-dynamic";

export default async function NewBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const { id } = await params;

  const [company, cities] = await Promise.all([
    getCompanyById(id),
    listActiveCities(),
  ]);

  if (!company) notFound();

  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <Link href={`/admin/companies/${company.id}`} className="admin-back-link">← {company.name_ar}</Link>
      <div className="admin-page-head">
        <h1>New branch</h1>
        <div className="sub">Adding a branch to <strong>{company.name_ar}</strong>.</div>
      </div>
      <div className="admin-card">
        <BranchForm mode="create" companyId={company.id} cities={cities} canEdit={canEdit} />
      </div>
    </>
  );
}
