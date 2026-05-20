/**
 * Hand-rolled validator for the car create/edit form.
 *
 * Mirrors src/lib/admin/companies/validate.ts in shape. Pure function — no
 * DB dependencies. Used by both create and update server actions.
 */

export type CarEntityStatus = "active" | "inactive" | "archived";
export type CarTransmission = "automatic" | "manual";

const ENTITY_STATUSES: CarEntityStatus[] = ["active", "inactive", "archived"];
const TRANSMISSIONS: CarTransmission[] = ["automatic", "manual"];

const SLUG_RE = /^[a-z0-9-]{1,80}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MIN_YEAR = 1990;
const MAX_YEAR = 2100;
const MIN_SEATS = 1;
const MAX_SEATS = 100;

export type CarFormPayload = {
  brand: string;
  brand_ar: string;
  model: string;
  model_ar: string;
  slug: string;
  year: number | null;
  category_id: string;
  seats: number | null;
  transmission: CarTransmission | null;
  fuel_type: string | null;
  image_url: string | null;
  description_ar: string | null;
  status: CarEntityStatus;
};

export type CarValidationResult =
  | { ok: true; value: CarFormPayload }
  | { ok: false; field: string; reason: string };

function cleanString(v: unknown, maxLen: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t.length === 0) return null;
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function parseOptionalInt(v: unknown, min: number, max: number, field: string):
  | { ok: true; value: number | null }
  | { ok: false; field: string; reason: string } {
  if (v === null || v === undefined || v === "") return { ok: true, value: null };
  const s = typeof v === "string" ? v.trim() : String(v);
  if (s === "") return { ok: true, value: null };
  if (!/^-?\d+$/.test(s)) return { ok: false, field, reason: "invalid_int" };
  const n = Number(s);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return { ok: false, field, reason: "invalid_int" };
  if (n < min || n > max) return { ok: false, field, reason: "out_of_range" };
  return { ok: true, value: n };
}

export function validateCarInput(raw: Record<string, unknown>): CarValidationResult {
  const brand_ar = cleanString(raw.brand_ar, 200);
  if (!brand_ar) return { ok: false, field: "brand_ar", reason: "required" };

  const brand = cleanString(raw.brand, 200);
  if (!brand) return { ok: false, field: "brand", reason: "required" };

  const model_ar = cleanString(raw.model_ar, 200);
  if (!model_ar) return { ok: false, field: "model_ar", reason: "required" };

  const model = cleanString(raw.model, 200);
  if (!model) return { ok: false, field: "model", reason: "required" };

  const slug = cleanString(raw.slug, 80);
  if (!slug) return { ok: false, field: "slug", reason: "required" };
  if (!SLUG_RE.test(slug)) return { ok: false, field: "slug", reason: "invalid_format" };

  const yearResult = parseOptionalInt(raw.year, MIN_YEAR, MAX_YEAR, "year");
  if (!yearResult.ok) return yearResult;

  const seatsResult = parseOptionalInt(raw.seats, MIN_SEATS, MAX_SEATS, "seats");
  if (!seatsResult.ok) return seatsResult;

  const category_id = typeof raw.category_id === "string" ? raw.category_id.trim() : "";
  if (!UUID_RE.test(category_id)) {
    return { ok: false, field: "category_id", reason: "required" };
  }

  let transmission: CarTransmission | null = null;
  const txRaw = typeof raw.transmission === "string" ? raw.transmission.trim() : "";
  if (txRaw !== "") {
    if (!(TRANSMISSIONS as string[]).includes(txRaw)) {
      return { ok: false, field: "transmission", reason: "invalid_value" };
    }
    transmission = txRaw as CarTransmission;
  }

  const fuel_type = cleanString(raw.fuel_type, 50);

  let image_url: string | null = null;
  const imgRaw = cleanString(raw.image_url, 500);
  if (imgRaw) {
    if (!isValidUrl(imgRaw)) return { ok: false, field: "image_url", reason: "invalid_url" };
    image_url = imgRaw;
  }

  const description_ar = cleanString(raw.description_ar, 2000);

  const status = typeof raw.status === "string" ? raw.status : "";
  if (!(ENTITY_STATUSES as string[]).includes(status)) {
    return { ok: false, field: "status", reason: "invalid_value" };
  }

  return {
    ok: true,
    value: {
      brand,
      brand_ar,
      model,
      model_ar,
      slug,
      year: yearResult.value,
      category_id,
      seats: seatsResult.value,
      transmission,
      fuel_type,
      image_url,
      description_ar,
      status: status as CarEntityStatus,
    },
  };
}

export { ENTITY_STATUSES, TRANSMISSIONS };
