"use client";

import { useState, useTransition } from "react";
import { createBranchAction, updateBranchAction } from "./actions";
import {
  BRANCH_STATUSES,
  type BranchEntityStatus,
} from "@/lib/admin/branches/validate";
import type { AdminCityOption } from "@/lib/admin/cities/list";

type Initial = {
  id?: string;
  city_id?: string;
  district?: string | null;
  address_ar?: string | null;
  address_en?: string | null;
  google_maps_url?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  is_main_branch?: boolean;
  status?: BranchEntityStatus;
};

export function BranchForm({
  mode,
  companyId,
  cities,
  initial,
  canEdit,
}: {
  mode: "create" | "edit";
  companyId: string;
  cities: AdminCityOption[];
  initial?: Initial;
  canEdit: boolean;
}) {
  const [city_id, setCityId] = useState(initial?.city_id ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [address_ar, setAddressAr] = useState(initial?.address_ar ?? "");
  const [address_en, setAddressEn] = useState(initial?.address_en ?? "");
  const [google_maps_url, setMapsUrl] = useState(initial?.google_maps_url ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [whatsapp_number, setWhatsapp] = useState(initial?.whatsapp_number ?? "");
  const [is_main_branch, setIsMain] = useState(initial?.is_main_branch ?? false);
  const [status, setStatus] = useState<BranchEntityStatus>(initial?.status ?? "active");

  const [fieldError, setFieldError] = useState<{ field?: string; error: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setFieldError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = mode === "create"
        ? await createBranchAction(companyId, formData)
        : await updateBranchAction(initial!.id!, companyId, formData);
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
      <div className="field">
        <label htmlFor="bf-city">City</label>
        <select id="bf-city" name="city_id" className="admin-select" value={city_id} onChange={e => setCityId(e.target.value)} disabled={disabled} required>
          <option value="">— select city —</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
        </select>
        {showErr("city_id") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="bf-district">District</label>
        <input id="bf-district" name="district" className="admin-input" dir="rtl" value={district ?? ""} onChange={e => setDistrict(e.target.value)} disabled={disabled} maxLength={200} placeholder="مثال: العليا" />
      </div>

      <div className="field">
        <label htmlFor="bf-addr-ar">Address (Arabic)</label>
        <textarea id="bf-addr-ar" name="address_ar" rows={2} className="admin-textarea" dir="rtl" value={address_ar ?? ""} onChange={e => setAddressAr(e.target.value)} disabled={disabled} maxLength={500} />
      </div>

      <div className="field">
        <label htmlFor="bf-addr-en">Address (English)</label>
        <textarea id="bf-addr-en" name="address_en" rows={2} className="admin-textarea" value={address_en ?? ""} onChange={e => setAddressEn(e.target.value)} disabled={disabled} maxLength={500} />
      </div>

      <div className="field">
        <label htmlFor="bf-maps">Google Maps URL</label>
        <input id="bf-maps" name="google_maps_url" type="url" className="admin-input" value={google_maps_url ?? ""} onChange={e => setMapsUrl(e.target.value)} disabled={disabled} maxLength={500} placeholder="https://maps.app.goo.gl/…" />
        {showErr("google_maps_url") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="bf-phone">Phone</label>
        <input id="bf-phone" name="phone" type="tel" className="admin-input" dir="ltr" value={phone ?? ""} onChange={e => setPhone(e.target.value)} disabled={disabled} maxLength={30} placeholder="011XXXXXXX" />
      </div>

      <div className="field">
        <label htmlFor="bf-whatsapp">WhatsApp number</label>
        <input id="bf-whatsapp" name="whatsapp_number" type="tel" className="admin-input" dir="ltr" value={whatsapp_number ?? ""} onChange={e => setWhatsapp(e.target.value)} disabled={disabled} maxLength={30} placeholder="+9665XXXXXXXX or 05XXXXXXXX" />
        <div style={{ fontSize: ".75rem", color: "#6B7280", marginTop: 4 }}>
          Will be normalised to <code className="admin-mono">+9665XXXXXXXX</code> on save.
        </div>
        {showErr("whatsapp_number") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer" }}>
          <input type="checkbox" name="is_main_branch" checked={is_main_branch} onChange={e => setIsMain(e.target.checked)} disabled={disabled} />
          <span>Main branch</span>
        </label>
        <div style={{ fontSize: ".75rem", color: "#6B7280", marginTop: 4 }}>
          Convention: each company should have only one main branch. Saving this here doesn&apos;t unset other branches automatically.
        </div>
      </div>

      <div className="field">
        <label htmlFor="bf-status">Status</label>
        <select id="bf-status" name="status" className="admin-select" value={status} onChange={e => setStatus(e.target.value as BranchEntityStatus)} disabled={disabled}>
          {BRANCH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!canEdit && <div className="admin-notice">Your role does not permit edits.</div>}
      {fieldError && !fieldError.field && <div className="admin-error">{fieldError.error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <button type="submit" className="admin-btn admin-btn--primary" disabled={disabled}>
        {pending ? "Saving…" : mode === "create" ? "Create branch" : "Save changes"}
      </button>
    </form>
  );
}
