import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { listActiveCarCategories } from "@/lib/admin/car-categories/list";
import { CarForm } from "../car-form";

export const dynamic = "force-dynamic";

export default async function NewCarPage() {
  const session = await requireRole(["owner", "admin", "editor"]);
  const categories = await listActiveCarCategories();
  const canEdit = session.role === "owner" || session.role === "admin";

  return (
    <>
      <Link href="/admin/cars" className="admin-back-link">← All cars</Link>
      <div className="admin-page-head">
        <h1>New car</h1>
        <div className="sub">Add a model to the catalogue. Inactive / archived models stay in the DB but are skipped from public-facing surfaces.</div>
      </div>
      <div className="admin-card">
        <CarForm mode="create" categories={categories} canEdit={canEdit} />
      </div>
    </>
  );
}
