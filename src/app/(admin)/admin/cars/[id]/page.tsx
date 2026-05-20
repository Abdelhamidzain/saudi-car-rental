import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getCarById } from "@/lib/admin/cars/get";
import { listActiveCarCategories } from "@/lib/admin/car-categories/list";
import { CarForm } from "../car-form";

export const dynamic = "force-dynamic";

function fmtRiyadh(ts: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(ts));
}

function statusBadgeClass(s: "active" | "inactive" | "archived"): string {
  return s === "active" ? "closed_won" : s === "archived" ? "closed_lost" : "spam";
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const { id } = await params;

  const [car, categories] = await Promise.all([
    getCarById(id),
    listActiveCarCategories(),
  ]);

  if (!car) notFound();

  const canEdit = session.role === "owner" || session.role === "admin";

  // Show a small notice if features_json has content — it's not editable here.
  const hasFeaturesJson =
    car.features_json !== null &&
    car.features_json !== undefined &&
    !(Array.isArray(car.features_json) && car.features_json.length === 0) &&
    !(typeof car.features_json === "object" && car.features_json !== null && Object.keys(car.features_json as object).length === 0);

  return (
    <>
      <Link href="/admin/cars" className="admin-back-link">← All cars</Link>

      <div className="admin-detail-head">
        <h1 style={{ fontFamily: "var(--font-cairo), 'Cairo', 'Tajawal', sans-serif" }}>
          {car.brand_ar} {car.model_ar}
          {car.year ? <span style={{ color: "#6B7280", fontWeight: 500, fontSize: "1rem", marginInlineStart: 8 }}>· {car.year}</span> : null}
        </h1>
        <span className={`admin-badge admin-badge--lg admin-badge--${statusBadgeClass(car.status)}`}>{car.status}</span>
      </div>

      <div className="admin-two-col">
        <div>
          <div className="admin-card">
            <h2><span className="admin-section-tag">Edit car</span></h2>
            <CarForm
              mode="edit"
              categories={categories}
              canEdit={canEdit}
              initial={{
                id: car.id,
                brand: car.brand,
                brand_ar: car.brand_ar,
                model: car.model,
                model_ar: car.model_ar,
                slug: car.slug,
                year: car.year,
                category_id: car.category_id,
                seats: car.seats,
                transmission: car.transmission,
                fuel_type: car.fuel_type,
                image_url: car.image_url,
                description_ar: car.description_ar,
                status: car.status,
              }}
            />
          </div>
        </div>

        <div>
          <div className="admin-card">
            <h2><span className="admin-section-tag">Meta</span></h2>
            <dl className="admin-dl">
              <dt>ID</dt><dd className="admin-mono" style={{ fontSize: ".78rem", wordBreak: "break-all" }}>{car.id}</dd>
              <dt>Slug</dt><dd className="admin-mono">{car.slug}</dd>
              <dt>Category</dt><dd>{car.category?.name_ar ?? "—"}</dd>
              <dt>English name</dt><dd>{car.brand} {car.model}</dd>
              <dt>Image</dt>
              <dd style={{ wordBreak: "break-all" }}>
                {car.image_url ? <a href={car.image_url} target="_blank" rel="noopener noreferrer" style={{ color: "#1B3A5C" }}>{car.image_url}</a> : "—"}
              </dd>
              <dt>Created</dt><dd>{fmtRiyadh(car.created_at)}</dd>
              <dt>Updated</dt><dd>{fmtRiyadh(car.updated_at)}</dd>
            </dl>
          </div>

          {hasFeaturesJson && (
            <div className="admin-card">
              <h2><span className="admin-section-tag">Features JSON</span></h2>
              <p style={{ fontSize: ".82rem", color: "#6B7280", marginBottom: 8 }}>
                This field exists on the row but is not editable in this UI yet. Use the Supabase SQL editor to change it.
              </p>
              <pre style={{ background: "#FAFAF7", border: "1px solid #E5E7EB", borderRadius: 8, padding: 12, fontSize: ".78rem", overflowX: "auto", color: "#374151" }}>
                {JSON.stringify(car.features_json, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
