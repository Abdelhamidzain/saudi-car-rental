"use client";

import { useState, useTransition } from "react";
import { createCompanyAction, updateCompanyAction } from "./actions";
import {
  TRUST_LEVELS,
  PUBLIC_STATUSES,
  ENTITY_STATUSES,
  type CompanyFormPayload,
  type TrustLevel,
  type PublicStatus,
  type EntityStatus,
} from "@/lib/admin/companies/validate";

type Initial = Partial<CompanyFormPayload> & { id?: string };

export function CompanyForm({
  mode,
  initial,
  canEdit,
}: {
  mode: "create" | "edit";
  initial?: Initial;
  canEdit: boolean;
}) {
  const [name_ar, setNameAr] = useState(initial?.name_ar ?? "");
  const [name_en, setNameEn] = useState(initial?.name_en ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [logo_url, setLogoUrl] = useState(initial?.logo_url ?? "");
  const [website_url, setWebsiteUrl] = useState(initial?.website_url ?? "");
  const [google_maps_url, setMapsUrl] = useState(initial?.google_maps_url ?? "");
  const [trust_level, setTrustLevel] = useState<TrustLevel>(initial?.trust_level ?? "new_partner");
  const [public_status, setPublicStatus] = useState<PublicStatus>(initial?.public_status ?? "draft");
  const [status, setStatus] = useState<EntityStatus>(initial?.status ?? "active");
  const [internal_notes, setInternalNotes] = useState(initial?.internal_notes ?? "");

  const [fieldError, setFieldError] = useState<{ field?: string; error: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setFieldError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = mode === "create"
        ? await createCompanyAction(formData)
        : await updateCompanyAction(initial!.id!, formData);
      if (!result.ok) {
        setFieldError({ field: result.field, error: result.error });
      } else if (mode === "edit") {
        setSuccess("Saved.");
      }
      // createCompanyAction redirects on success — no fall-through.
    });
  }

  const disabled = !canEdit || pending;
  const showErr = (f: string) => fieldError?.field === f;

  return (
    <form className="admin-form" action={onSubmit}>
      <div className="field">
        <label htmlFor="cf-name-ar">Arabic name</label>
        <input id="cf-name-ar" name="name_ar" className="admin-input" dir="rtl" value={name_ar} onChange={e => setNameAr(e.target.value)} disabled={disabled} maxLength={200} required />
        {showErr("name_ar") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="cf-name-en">English name</label>
        <input id="cf-name-en" name="name_en" className="admin-input" value={name_en} onChange={e => setNameEn(e.target.value)} disabled={disabled} maxLength={200} required />
        {showErr("name_en") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="cf-slug">Slug</label>
        <input id="cf-slug" name="slug" className="admin-input" value={slug} onChange={e => setSlug(e.target.value)} disabled={disabled} maxLength={80} required placeholder="lowercase-with-hyphens" />
        {showErr("slug") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="cf-logo">Logo URL</label>
        <input id="cf-logo" name="logo_url" type="url" className="admin-input" value={logo_url ?? ""} onChange={e => setLogoUrl(e.target.value)} disabled={disabled} maxLength={500} placeholder="https://…" />
        {showErr("logo_url") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="cf-website">Website URL</label>
        <input id="cf-website" name="website_url" type="url" className="admin-input" value={website_url ?? ""} onChange={e => setWebsiteUrl(e.target.value)} disabled={disabled} maxLength={500} placeholder="https://…" />
        {showErr("website_url") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="cf-maps">Google Maps URL</label>
        <input id="cf-maps" name="google_maps_url" type="url" className="admin-input" value={google_maps_url ?? ""} onChange={e => setMapsUrl(e.target.value)} disabled={disabled} maxLength={500} placeholder="https://maps.app.goo.gl/…" />
        {showErr("google_maps_url") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="cf-trust">Trust level (internal only)</label>
        <select id="cf-trust" name="trust_level" className="admin-select" value={trust_level} onChange={e => setTrustLevel(e.target.value as TrustLevel)} disabled={disabled}>
          {TRUST_LEVELS.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="cf-public">Public status</label>
        <select id="cf-public" name="public_status" className="admin-select" value={public_status} onChange={e => setPublicStatus(e.target.value as PublicStatus)} disabled={disabled}>
          {PUBLIC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="cf-status">Status</label>
        <select id="cf-status" name="status" className="admin-select" value={status} onChange={e => setStatus(e.target.value as EntityStatus)} disabled={disabled}>
          {ENTITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="cf-notes">Internal notes</label>
        <textarea id="cf-notes" name="internal_notes" rows={3} className="admin-textarea" value={internal_notes ?? ""} onChange={e => setInternalNotes(e.target.value)} disabled={disabled} maxLength={2000} />
      </div>

      {!canEdit && <div className="admin-notice">Your role does not permit edits.</div>}
      {fieldError && !fieldError.field && <div className="admin-error">{fieldError.error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <button type="submit" className="admin-btn admin-btn--primary" disabled={disabled}>
        {pending ? "Saving…" : mode === "create" ? "Create company" : "Save changes"}
      </button>
    </form>
  );
}
