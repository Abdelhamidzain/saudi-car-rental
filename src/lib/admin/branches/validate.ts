/**
 * Branch validator. Normalizes WhatsApp via the existing Saudi phone helper,
 * so admin can paste "05xxx" / "+9665xxx" / etc. and the server stores the
 * canonical `+9665XXXXXXXX` form.
 */

import { normalizeSaudiPhone } from "@/lib/leads/normalize-phone";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BranchEntityStatus = "active" | "inactive" | "archived";
const BRANCH_STATUSES: BranchEntityStatus[] = ["active", "inactive", "archived"];

export type BranchFormPayload = {
  city_id: string;
  district: string | null;
  address_ar: string | null;
  address_en: string | null;
  google_maps_url: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  is_main_branch: boolean;
  status: BranchEntityStatus;
};

export type BranchValidationResult =
  | { ok: true; value: BranchFormPayload }
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

export function validateBranchInput(raw: Record<string, unknown>): BranchValidationResult {
  const city_id = typeof raw.city_id === "string" ? raw.city_id : "";
  if (!UUID_RE.test(city_id)) return { ok: false, field: "city_id", reason: "required" };

  const district = cleanString(raw.district, 200);
  const address_ar = cleanString(raw.address_ar, 500);
  const address_en = cleanString(raw.address_en, 500);

  let google_maps_url: string | null = null;
  const mapsRaw = cleanString(raw.google_maps_url, 500);
  if (mapsRaw) {
    if (!isValidUrl(mapsRaw)) return { ok: false, field: "google_maps_url", reason: "invalid_url" };
    google_maps_url = mapsRaw;
  }

  const phone = cleanString(raw.phone, 30);

  let whatsapp_number: string | null = null;
  const whatsappRaw = cleanString(raw.whatsapp_number, 30);
  if (whatsappRaw) {
    const normalized = normalizeSaudiPhone(whatsappRaw);
    if (!normalized) return { ok: false, field: "whatsapp_number", reason: "invalid_saudi_mobile" };
    whatsapp_number = normalized;
  }

  const is_main_branch = raw.is_main_branch === true || raw.is_main_branch === "true" || raw.is_main_branch === "on";

  const status = typeof raw.status === "string" ? raw.status : "";
  if (!(BRANCH_STATUSES as string[]).includes(status)) {
    return { ok: false, field: "status", reason: "invalid_value" };
  }

  return {
    ok: true,
    value: {
      city_id,
      district,
      address_ar,
      address_en,
      google_maps_url,
      phone,
      whatsapp_number,
      is_main_branch,
      status: status as BranchEntityStatus,
    },
  };
}

export { BRANCH_STATUSES };
