import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getCompanyById } from "@/lib/admin/companies/get";
import { getBranchById } from "@/lib/admin/branches/get";
import { listActiveCities } from "@/lib/admin/cities/list";
import { BranchForm } from "../branch-form";

export const dynamic = "force-dynamic";

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string; branchId: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const { id, branchId } = await params;

  const [company, branch, cities] = await Promise.all([
    getCompanyById(id),
    getBranchById(branchId),
    listActiveCities(),
  ]);

  if (!company || !branch) notFound();
  // Defensive: ensure the branch actually belongs to the company in the URL.
  if (branch.company_id !== company.id) notFound();

  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <Link href={`/admin/companies/${company.id}`} className="admin-back-link">← {company.name_ar}</Link>
      <div className="admin-page-head">
        <h1>Edit branch</h1>
        <div className="sub">
          Branch under <strong>{company.name_ar}</strong>
          {branch.district ? <> · {branch.district}</> : null}
        </div>
      </div>
      <div className="admin-card">
        <BranchForm
          mode="edit"
          companyId={company.id}
          cities={cities}
          canEdit={canEdit}
          initial={{
            id: branch.id,
            city_id: branch.city_id,
            district: branch.district,
            address_ar: branch.address_ar,
            address_en: branch.address_en,
            google_maps_url: branch.google_maps_url,
            phone: branch.phone,
            whatsapp_number: branch.whatsapp_number,
            is_main_branch: branch.is_main_branch,
            status: branch.status,
          }}
        />
      </div>
    </>
  );
}
