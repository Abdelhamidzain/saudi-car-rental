"use client";

import { useMemo, useState, useTransition } from "react";
import { createOfferAction, updateOfferAction } from "./actions";
import {
  PRICE_STATUSES,
  AVAILABILITY_STATUSES,
  APPROVAL_STATUSES,
  OFFER_PUBLIC_STATUSES,
  OFFER_ENTITY_STATUSES,
  type ApprovalStatus,
  type AvailabilityStatus,
  type OfferEntityStatus,
  type OfferFormPayload,
  type OfferPublicStatus,
  type PriceStatus,
} from "@/lib/admin/offers/validate";
import type { AdminCompanyListRow } from "@/lib/admin/companies/list";
import type { AdminAllBranchRow } from "@/lib/admin/branches/list-all";
import type { AdminCarListRow } from "@/lib/admin/cars/list";

type Initial = Partial<OfferFormPayload> & { id?: string };

type AirportOption = { id: string; name_ar: string; code: string };

function statusSuffix(status: string): string {
  return status === "active" ? "" : ` (${status})`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function OfferForm({
  mode,
  companies,
  branches,
  cars,
  airports,
  initial,
  canEdit,
}: {
  mode: "create" | "edit";
  companies: AdminCompanyListRow[];
  branches: AdminAllBranchRow[];
  cars: AdminCarListRow[];
  airports: AirportOption[];
  initial?: Initial;
  canEdit: boolean;
}) {
  // Who
  const [company_id, setCompanyId] = useState(initial?.company_id ?? "");
  const [branch_id, setBranchId] = useState(initial?.branch_id ?? "");
  const [car_id, setCarId] = useState(initial?.car_id ?? "");
  const [airport_id, setAirportId] = useState(initial?.airport_id ?? "");

  // Pricing
  const [daily, setDaily] = useState(initial?.daily_price_from != null ? String(initial.daily_price_from) : "");
  const [weekly, setWeekly] = useState(initial?.weekly_price_from != null ? String(initial.weekly_price_from) : "");
  const [monthly, setMonthly] = useState(initial?.monthly_price_from != null ? String(initial.monthly_price_from) : "");
  const [price_status, setPriceStatus] = useState<PriceStatus>(initial?.price_status ?? "starts_from");

  // Terms
  const [deposit, setDeposit] = useState(initial?.deposit_amount != null ? String(initial.deposit_amount) : "");
  const [insurance_included, setInsuranceIncluded] = useState<string>(
    initial?.insurance_included === true ? "true" : initial?.insurance_included === false ? "false" : "",
  );
  const [insurance_type, setInsuranceType] = useState(initial?.insurance_type ?? "");
  const [mileage, setMileage] = useState(initial?.mileage_limit != null ? String(initial.mileage_limit) : "");
  const [delivery, setDelivery] = useState(initial?.delivery_available ?? false);
  const [airportDelivery, setAirportDelivery] = useState(initial?.airport_delivery_available ?? false);

  // Workflow
  const [availability_status, setAvailability] = useState<AvailabilityStatus>(initial?.availability_status ?? "needs_confirmation");
  const [approval_status, setApprovalStatus] = useState<ApprovalStatus>(initial?.approval_status ?? "pending_review");
  const [public_status, setPublicStatus] = useState<OfferPublicStatus>(initial?.public_status ?? "draft");
  const [status, setStatus] = useState<OfferEntityStatus>(initial?.status ?? "active");

  const [fieldError, setFieldError] = useState<{ field?: string; error: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Cascading branch filter
  const branchesForCompany = useMemo(
    () => (company_id ? branches.filter(b => b.company_id === company_id) : []),
    [branches, company_id],
  );
  const selectedBranch = branches.find(b => b.id === branch_id) ?? null;
  const cityLabel = selectedBranch?.city ? selectedBranch.city.name_ar : "—";

  function suggestWeekly() {
    const d = parseFloat(daily);
    if (!Number.isFinite(d)) return;
    setWeekly(String(round2(d * 7 * 0.85)));
  }
  function suggestMonthly() {
    const d = parseFloat(daily);
    if (!Number.isFinite(d)) return;
    setMonthly(String(round2(d * 30 * 0.70)));
  }

  function onSubmit(formData: FormData) {
    setFieldError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = mode === "create"
        ? await createOfferAction(formData)
        : await updateOfferAction(initial!.id!, formData);
      if (!result.ok) {
        setFieldError({ field: result.field, error: result.error });
      } else if (mode === "edit") {
        setSuccess("Saved.");
      }
    });
  }

  const disabled = !canEdit || pending;
  const showErr = (f: string) => fieldError?.field === f;

  return (
    <form className="admin-form" action={onSubmit}>
      {/* ── Section 1: Who ─────────────────────────────────────────────── */}
      <h3 style={{ fontFamily: "var(--font-cairo), 'Cairo', 'Tajawal', sans-serif", fontSize: ".95rem", fontWeight: 800, color: "#1A1A2E", marginTop: 4, marginBottom: 4 }}>Who</h3>

      <div className="field">
        <label htmlFor="of-company">Company</label>
        <select id="of-company" name="company_id" className="admin-select" value={company_id} onChange={e => { setCompanyId(e.target.value); setBranchId(""); }} disabled={disabled} required>
          <option value="">— select company —</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name_ar}{statusSuffix(c.status)}</option>
          ))}
        </select>
        {showErr("company_id") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="of-branch">Branch</label>
        <select id="of-branch" name="branch_id" className="admin-select" value={branch_id} onChange={e => setBranchId(e.target.value)} disabled={disabled || !company_id} required>
          <option value="">{company_id ? "— select branch —" : "— pick a company first —"}</option>
          {branchesForCompany.map(b => {
            const place = b.district ?? b.address_ar ?? "Branch";
            const city = b.city?.name_ar ? ` · ${b.city.name_ar}` : "";
            const suffix = statusSuffix(b.status);
            return <option key={b.id} value={b.id}>{place}{city}{suffix}</option>;
          })}
        </select>
        {showErr("branch_id") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label>City (derived from branch)</label>
        <input className="admin-input" value={cityLabel} disabled readOnly dir="rtl" />
      </div>

      <div className="field">
        <label htmlFor="of-car">Car</label>
        <select id="of-car" name="car_id" className="admin-select" value={car_id} onChange={e => setCarId(e.target.value)} disabled={disabled} required>
          <option value="">— select car —</option>
          {cars.map(c => (
            <option key={c.id} value={c.id}>
              {c.brand_ar} {c.model_ar}{c.year ? ` · ${c.year}` : ""}{c.category?.name_ar ? ` · ${c.category.name_ar}` : ""}{statusSuffix(c.status)}
            </option>
          ))}
        </select>
        {showErr("car_id") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="of-airport">Airport (optional)</label>
        <select id="of-airport" name="airport_id" className="admin-select" value={airport_id ?? ""} onChange={e => setAirportId(e.target.value)} disabled={disabled}>
          <option value="">— none —</option>
          {airports.map(a => <option key={a.id} value={a.id}>{a.name_ar} ({a.code})</option>)}
        </select>
      </div>

      {/* ── Section 2: Pricing ─────────────────────────────────────────── */}
      <h3 style={{ fontFamily: "var(--font-cairo), 'Cairo', 'Tajawal', sans-serif", fontSize: ".95rem", fontWeight: 800, color: "#1A1A2E", marginTop: 16, marginBottom: 4 }}>Pricing</h3>
      <div style={{ fontSize: ".75rem", color: "#6B7280", marginBottom: 4 }}>
        At least one price tier required. All prices are indicative "starts-from" values; final price is confirmed by the partner.
      </div>

      <div className="field">
        <label htmlFor="of-daily">Daily price (SAR)</label>
        <input id="of-daily" name="daily_price_from" type="number" step="0.01" min="0" className="admin-input" value={daily} onChange={e => setDaily(e.target.value)} disabled={disabled} placeholder="e.g. 150" />
        {showErr("daily_price_from") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="of-weekly">Weekly price (SAR)</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input id="of-weekly" name="weekly_price_from" type="number" step="0.01" min="0" className="admin-input" value={weekly} onChange={e => setWeekly(e.target.value)} disabled={disabled} placeholder="e.g. 892.50" style={{ flex: 1 }} />
          <button type="button" className="admin-btn admin-btn--secondary" onClick={suggestWeekly} disabled={disabled || !daily} title="Suggest from daily × 7 × 0.85">✨ Suggest</button>
        </div>
        <div style={{ fontSize: ".72rem", color: "#9CA3AF", marginTop: 4 }}>Suggestion only — partner confirms final price.</div>
        {showErr("weekly_price_from") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="of-monthly">Monthly price (SAR)</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input id="of-monthly" name="monthly_price_from" type="number" step="0.01" min="0" className="admin-input" value={monthly} onChange={e => setMonthly(e.target.value)} disabled={disabled} placeholder="e.g. 3150" style={{ flex: 1 }} />
          <button type="button" className="admin-btn admin-btn--secondary" onClick={suggestMonthly} disabled={disabled || !daily} title="Suggest from daily × 30 × 0.70">✨ Suggest</button>
        </div>
        <div style={{ fontSize: ".72rem", color: "#9CA3AF", marginTop: 4 }}>Suggestion only — partner confirms final price.</div>
        {showErr("monthly_price_from") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="of-pricestatus">Price status</label>
        <select id="of-pricestatus" name="price_status" className="admin-select" value={price_status} onChange={e => setPriceStatus(e.target.value as PriceStatus)} disabled={disabled}>
          {PRICE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {/* ── Section 3: Terms ───────────────────────────────────────────── */}
      <h3 style={{ fontFamily: "var(--font-cairo), 'Cairo', 'Tajawal', sans-serif", fontSize: ".95rem", fontWeight: 800, color: "#1A1A2E", marginTop: 16, marginBottom: 4 }}>Terms</h3>

      <div className="field">
        <label htmlFor="of-deposit">Deposit (SAR, optional)</label>
        <input id="of-deposit" name="deposit_amount" type="number" step="0.01" min="0" className="admin-input" value={deposit} onChange={e => setDeposit(e.target.value)} disabled={disabled} />
        {showErr("deposit_amount") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="of-ins-incl">Insurance included</label>
        <select id="of-ins-incl" name="insurance_included" className="admin-select" value={insurance_included} onChange={e => setInsuranceIncluded(e.target.value)} disabled={disabled}>
          <option value="">— unspecified —</option>
          <option value="true">yes</option>
          <option value="false">no</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="of-ins-type">Insurance type</label>
        <input id="of-ins-type" name="insurance_type" className="admin-input" value={insurance_type ?? ""} onChange={e => setInsuranceType(e.target.value)} disabled={disabled} maxLength={200} placeholder="e.g. comprehensive / third party only" />
      </div>

      <div className="field">
        <label htmlFor="of-mileage">Mileage limit (km/day, optional)</label>
        <input id="of-mileage" name="mileage_limit" type="number" step="1" min="0" className="admin-input" value={mileage} onChange={e => setMileage(e.target.value)} disabled={disabled} placeholder="e.g. 300" />
        {showErr("mileage_limit") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer" }}>
          <input type="checkbox" name="delivery_available" checked={delivery} onChange={e => setDelivery(e.target.checked)} disabled={disabled} />
          <span>Delivery available</span>
        </label>
      </div>

      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer" }}>
          <input type="checkbox" name="airport_delivery_available" checked={airportDelivery} onChange={e => setAirportDelivery(e.target.checked)} disabled={disabled} />
          <span>Airport delivery available</span>
        </label>
      </div>

      {/* ── Section 4: Workflow ────────────────────────────────────────── */}
      <h3 style={{ fontFamily: "var(--font-cairo), 'Cairo', 'Tajawal', sans-serif", fontSize: ".95rem", fontWeight: 800, color: "#1A1A2E", marginTop: 16, marginBottom: 4 }}>Workflow</h3>
      <div style={{ fontSize: ".75rem", color: "#6B7280", marginBottom: 4 }}>
        Publishing requires approval. Setting <code>approval_status=rejected</code> auto-hides the offer.
      </div>

      <div className="field">
        <label htmlFor="of-avail">Availability status</label>
        <select id="of-avail" name="availability_status" className="admin-select" value={availability_status} onChange={e => setAvailability(e.target.value as AvailabilityStatus)} disabled={disabled}>
          {AVAILABILITY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="of-approval">Approval status</label>
        <select id="of-approval" name="approval_status" className="admin-select" value={approval_status} onChange={e => setApprovalStatus(e.target.value as ApprovalStatus)} disabled={disabled}>
          {APPROVAL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="of-public">Public status</label>
        <select id="of-public" name="public_status" className="admin-select" value={public_status} onChange={e => setPublicStatus(e.target.value as OfferPublicStatus)} disabled={disabled}>
          {OFFER_PUBLIC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {showErr("public_status") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="of-status">Status</label>
        <select id="of-status" name="status" className="admin-select" value={status} onChange={e => setStatus(e.target.value as OfferEntityStatus)} disabled={disabled}>
          {OFFER_ENTITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!canEdit && <div className="admin-notice">Your role does not permit edits.</div>}
      {fieldError && !fieldError.field && <div className="admin-error">{fieldError.error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <button type="submit" className="admin-btn admin-btn--primary" disabled={disabled}>
        {pending ? "Saving…" : mode === "create" ? "Create offer" : "Save changes"}
      </button>
    </form>
  );
}
