import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { listCompaniesForAdmin } from "@/lib/admin/companies/list";
import { listAllBranchesForAdmin } from "@/lib/admin/branches/list-all";
import { listCarsForAdmin } from "@/lib/admin/cars/list";
import { OfferForm } from "../offer-form";

export const dynamic = "force-dynamic";

async function listAirports() {
  const { data } = await getSupabaseAdminClient()
    .from("airports")
    .select("id, name_ar, code")
    .eq("status", "active")
    .order("name_ar", { ascending: true });
  return (data ?? []) as unknown as Array<{ id: string; name_ar: string; code: string }>;
}

export default async function NewOfferPage() {
  const session = await requireRole(["owner", "admin", "editor"]);

  const [companies, branches, cars, airports] = await Promise.all([
    listCompaniesForAdmin({}),
    listAllBranchesForAdmin(),
    listCarsForAdmin({}),
    listAirports(),
  ]);
  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <Link href="/admin/offers" className="admin-back-link">← All offers</Link>
      <div className="admin-page-head">
        <h1>New offer</h1>
        <div className="sub">
          Combine a company, branch, car, and price tier. Offers default to <code>draft</code> + <code>pending_review</code>.
        </div>
      </div>
      <div className="admin-card">
        <OfferForm mode="create" companies={companies} branches={branches} cars={cars} airports={airports} canEdit={canEdit} />
      </div>
    </>
  );
}
