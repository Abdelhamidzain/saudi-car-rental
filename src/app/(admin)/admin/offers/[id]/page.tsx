import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOfferById } from "@/lib/admin/offers/get";
import { listCompaniesForAdmin } from "@/lib/admin/companies/list";
import { listAllBranchesForAdmin } from "@/lib/admin/branches/list-all";
import { listCarsForAdmin } from "@/lib/admin/cars/list";
import { OfferForm } from "../offer-form";

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

async function listAirports() {
  const { data } = await getSupabaseAdminClient()
    .from("airports")
    .select("id, name_ar, code")
    .eq("status", "active")
    .order("name_ar", { ascending: true });
  return (data ?? []) as unknown as Array<{ id: string; name_ar: string; code: string }>;
}

function approvalBadge(s: string): string {
  return s === "approved" || s === "auto_approved" ? "closed_won" : s === "rejected" ? "closed_lost" : "reviewed";
}

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["owner", "admin", "editor"]);
  const { id } = await params;

  const offer = await getOfferById(id);
  if (!offer) notFound();

  const [companies, branches, cars, airports] = await Promise.all([
    listCompaniesForAdmin({}),
    listAllBranchesForAdmin(),
    listCarsForAdmin({}),
    listAirports(),
  ]);
  const canEdit = session.role === "owner" || session.role === "admin";

  const stalePrice =
    !offer.last_updated_at || Date.now() - new Date(offer.last_updated_at).getTime() > STALE_AFTER_MS;

  return (
    <>
      <Link href="/admin/offers" className="admin-back-link">← All offers</Link>

      <div className="admin-detail-head">
        <h1 style={{ fontFamily: "var(--font-cairo), 'Cairo', 'Tajawal', sans-serif" }}>
          {offer.car?.brand_ar ?? "—"} {offer.car?.model_ar ?? ""}
          {offer.car?.year ? <span style={{ color: "#6B7280", fontWeight: 500, fontSize: "1rem", marginInlineStart: 8 }}>· {offer.car.year}</span> : null}
        </h1>
        <span className={`admin-badge admin-badge--lg admin-badge--${approvalBadge(offer.approval_status)}`}>{offer.approval_status.replace(/_/g, " ")}</span>
      </div>

      <div className="admin-two-col">
        <div>
          <div className="admin-card">
            <h2><span className="admin-section-tag">Edit offer</span></h2>
            <OfferForm
              mode="edit"
              companies={companies}
              branches={branches}
              cars={cars}
              airports={airports}
              canEdit={canEdit}
              initial={{
                id: offer.id,
                company_id: offer.company_id,
                branch_id: offer.branch_id,
                car_id: offer.car_id,
                airport_id: offer.airport_id,
                daily_price_from: offer.daily_price_from,
                weekly_price_from: offer.weekly_price_from,
                monthly_price_from: offer.monthly_price_from,
                deposit_amount: offer.deposit_amount,
                insurance_included: offer.insurance_included,
                insurance_type: offer.insurance_type,
                mileage_limit: offer.mileage_limit,
                delivery_available: offer.delivery_available,
                airport_delivery_available: offer.airport_delivery_available,
                price_status: offer.price_status,
                availability_status: offer.availability_status,
                approval_status: offer.approval_status,
                public_status: offer.public_status,
                status: offer.status,
              }}
            />
          </div>
        </div>

        <div>
          <div className="admin-card">
            <h2><span className="admin-section-tag">Meta</span></h2>
            <dl className="admin-dl">
              <dt>ID</dt><dd className="admin-mono" style={{ fontSize: ".78rem", wordBreak: "break-all" }}>{offer.id}</dd>
              <dt>Company</dt><dd>{offer.company?.name_ar ?? "—"}</dd>
              <dt>Branch</dt><dd>{offer.branch?.district ?? offer.branch?.address_ar ?? "—"}</dd>
              <dt>City</dt><dd>{offer.city?.name_ar ?? "—"}</dd>
              <dt>Airport</dt><dd>{offer.airport ? `${offer.airport.name_ar} (${offer.airport.code})` : "—"}</dd>
              <dt>Public status</dt><dd>{offer.public_status}</dd>
              <dt>Created</dt><dd>{fmtRiyadh(offer.created_at)}</dd>
              <dt>Updated</dt><dd>{fmtRiyadh(offer.updated_at)}</dd>
              <dt>Price updated</dt>
              <dd style={{ color: stalePrice ? "#991B1B" : "#374151" }}>
                {fmtRiyadh(offer.last_updated_at)}{stalePrice ? " ⚠ (stale)" : ""}
              </dd>
            </dl>
          </div>

          {stalePrice && (
            <div className="admin-card admin-notice" style={{ marginTop: 12 }}>
              Price hasn&apos;t been refreshed in 30+ days. Verify with the partner before relying on it.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
