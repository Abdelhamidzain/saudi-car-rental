"use client";

import { useState, useTransition } from "react";
import { createCarAction, updateCarAction } from "./actions";
import {
  ENTITY_STATUSES,
  TRANSMISSIONS,
  type CarEntityStatus,
  type CarFormPayload,
  type CarTransmission,
} from "@/lib/admin/cars/validate";
import type { AdminCarCategoryOption } from "@/lib/admin/car-categories/list";

type Initial = Partial<CarFormPayload> & { id?: string };

export function CarForm({
  mode,
  categories,
  initial,
  canEdit,
}: {
  mode: "create" | "edit";
  categories: AdminCarCategoryOption[];
  initial?: Initial;
  canEdit: boolean;
}) {
  const [brand_ar, setBrandAr] = useState(initial?.brand_ar ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model_ar, setModelAr] = useState(initial?.model_ar ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [year, setYear] = useState(initial?.year != null ? String(initial.year) : "");
  const [category_id, setCategoryId] = useState(initial?.category_id ?? "");
  const [seats, setSeats] = useState(initial?.seats != null ? String(initial.seats) : "");
  const [transmission, setTransmission] = useState<string>(initial?.transmission ?? "");
  const [fuel_type, setFuelType] = useState(initial?.fuel_type ?? "");
  const [image_url, setImageUrl] = useState(initial?.image_url ?? "");
  const [description_ar, setDescriptionAr] = useState(initial?.description_ar ?? "");
  const [status, setStatus] = useState<CarEntityStatus>(initial?.status ?? "active");

  const [fieldError, setFieldError] = useState<{ field?: string; error: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setFieldError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = mode === "create"
        ? await createCarAction(formData)
        : await updateCarAction(initial!.id!, formData);
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
        <label htmlFor="car-brand-ar">Brand (Arabic)</label>
        <input id="car-brand-ar" name="brand_ar" className="admin-input" dir="rtl" value={brand_ar ?? ""} onChange={e => setBrandAr(e.target.value)} disabled={disabled} maxLength={200} required />
        {showErr("brand_ar") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-brand">Brand (English)</label>
        <input id="car-brand" name="brand" className="admin-input" value={brand ?? ""} onChange={e => setBrand(e.target.value)} disabled={disabled} maxLength={200} required />
        {showErr("brand") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-model-ar">Model (Arabic)</label>
        <input id="car-model-ar" name="model_ar" className="admin-input" dir="rtl" value={model_ar ?? ""} onChange={e => setModelAr(e.target.value)} disabled={disabled} maxLength={200} required />
        {showErr("model_ar") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-model">Model (English)</label>
        <input id="car-model" name="model" className="admin-input" value={model ?? ""} onChange={e => setModel(e.target.value)} disabled={disabled} maxLength={200} required />
        {showErr("model") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-slug">Slug</label>
        <input id="car-slug" name="slug" className="admin-input" value={slug} onChange={e => setSlug(e.target.value)} disabled={disabled} maxLength={80} required placeholder="lowercase-with-hyphens" />
        {showErr("slug") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-year">Year</label>
        <input id="car-year" name="year" type="number" min={1990} max={2100} step={1} className="admin-input" value={year} onChange={e => setYear(e.target.value)} disabled={disabled} placeholder="e.g. 2024" />
        {showErr("year") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-category">Category</label>
        <select id="car-category" name="category_id" className="admin-select" value={category_id} onChange={e => setCategoryId(e.target.value)} disabled={disabled} required>
          <option value="">— select category —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
        </select>
        {showErr("category_id") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-seats">Seats</label>
        <input id="car-seats" name="seats" type="number" min={1} max={100} step={1} className="admin-input" value={seats} onChange={e => setSeats(e.target.value)} disabled={disabled} placeholder="e.g. 5" />
        {showErr("seats") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-transmission">Transmission</label>
        <select id="car-transmission" name="transmission" className="admin-select" value={transmission} onChange={e => setTransmission(e.target.value)} disabled={disabled}>
          <option value="">—</option>
          {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {showErr("transmission") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-fuel">Fuel type</label>
        <input id="car-fuel" name="fuel_type" className="admin-input" value={fuel_type ?? ""} onChange={e => setFuelType(e.target.value)} disabled={disabled} maxLength={50} placeholder="petrol / diesel / hybrid / electric" />
      </div>

      <div className="field">
        <label htmlFor="car-image">Image URL</label>
        <input id="car-image" name="image_url" type="url" className="admin-input" value={image_url ?? ""} onChange={e => setImageUrl(e.target.value)} disabled={disabled} maxLength={500} placeholder="https://…" />
        {showErr("image_url") && <div className="admin-error">{fieldError!.error}</div>}
      </div>

      <div className="field">
        <label htmlFor="car-desc">Description (Arabic)</label>
        <textarea id="car-desc" name="description_ar" rows={4} className="admin-textarea" dir="rtl" value={description_ar ?? ""} onChange={e => setDescriptionAr(e.target.value)} disabled={disabled} maxLength={2000} />
      </div>

      <div className="field">
        <label htmlFor="car-status">Status</label>
        <select id="car-status" name="status" className="admin-select" value={status} onChange={e => setStatus(e.target.value as CarEntityStatus)} disabled={disabled}>
          {ENTITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!canEdit && <div className="admin-notice">Your role does not permit edits.</div>}
      {fieldError && !fieldError.field && <div className="admin-error">{fieldError.error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <button type="submit" className="admin-btn admin-btn--primary" disabled={disabled}>
        {pending ? "Saving…" : mode === "create" ? "Create car" : "Save changes"}
      </button>
    </form>
  );
}
