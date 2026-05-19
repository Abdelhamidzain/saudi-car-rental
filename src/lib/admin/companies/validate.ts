/**
 * Hand-rolled validator for the company create/edit form.
 *
 * Mirrors the leads validator style — returns either:
 *   { ok: true, value: <typed clean payload> }
 *   { ok: false, field, reason }
 *
 * Used by both create and update server actions. Pure function; no DB
 * dependencies so it can be unit-tested directly.
 */

export type TrustLevel =
  | "new_partner"
  | "verified_partner"
  | "trusted_partner"
  | "auto_approved_partner"
  | "blocked";

export type PublicStatus = "draft" | "published" | "hidden" | "blocked";

export type EntityStatus = "active" | "inactive" | "archived";

const TRUST_LEVELS: TrustLevel[] = [
  "new_partner",
  "verified_partner",
  "trusted_partner",
  "auto_approved_partner",
  "blocked",
];
const PUBLIC_STATUSES: PublicStatus[] = ["draft", "published", "hidden", "blocked"];
const ENTITY_STATUSES: EntityStatus[] = ["active", "inactive", "archived"];

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

export type CompanyFormPayload = {
  name_ar: string;
  name_en: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  google_maps_url: string | null;
  trust_level: TrustLevel;
  public_status: PublicStatus;
  status: EntityStatus;
  internal_notes: string | null;
};

export type CompanyValidationResult =
  | { ok: true; value: CompanyFormPayload }
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

function cleanOptionalUrl(v: unknown, field: string):
  | { ok: true; value: string | null }
  | { ok: false; field: string; reason: string } {
  const s = cleanString(v, 500);
  if (!s) return { ok: true, value: null };
  if (!isValidUrl(s)) return { ok: false, field, reason: "invalid_url" };
  return { ok: true, value: s };
}

export function validateCompanyInput(raw: Record<string, unknown>): CompanyValidationResult {
  const name_ar = cleanString(raw.name_ar, 200);
  if (!name_ar) return { ok: false, field: "name_ar", reason: "required" };

  const name_en = cleanString(raw.name_en, 200);
  if (!name_en) return { ok: false, field: "name_en", reason: "required" };

  const slug = cleanString(raw.slug, 80);
  if (!slug) return { ok: false, field: "slug", reason: "required" };
  if (!SLUG_RE.test(slug)) return { ok: false, field: "slug", reason: "invalid_format" };

  const logoUrl = cleanOptionalUrl(raw.logo_url, "logo_url");
  if (!logoUrl.ok) return logoUrl;
  const websiteUrl = cleanOptionalUrl(raw.website_url, "website_url");
  if (!websiteUrl.ok) return websiteUrl;
  const mapsUrl = cleanOptionalUrl(raw.google_maps_url, "google_maps_url");
  if (!mapsUrl.ok) return mapsUrl;

  const trust_level = typeof raw.trust_level === "string" ? raw.trust_level : "";
  if (!(TRUST_LEVELS as string[]).includes(trust_level)) {
    return { ok: false, field: "trust_level", reason: "invalid_value" };
  }

  const public_status = typeof raw.public_status === "string" ? raw.public_status : "";
  if (!(PUBLIC_STATUSES as string[]).includes(public_status)) {
    return { ok: false, field: "public_status", reason: "invalid_value" };
  }

  const status = typeof raw.status === "string" ? raw.status : "";
  if (!(ENTITY_STATUSES as string[]).includes(status)) {
    return { ok: false, field: "status", reason: "invalid_value" };
  }

  const internal_notes = cleanString(raw.internal_notes, 2000);

  return {
    ok: true,
    value: {
      name_ar,
      name_en,
      slug,
      logo_url: logoUrl.value,
      website_url: websiteUrl.value,
      google_maps_url: mapsUrl.value,
      trust_level: trust_level as TrustLevel,
      public_status: public_status as PublicStatus,
      status: status as EntityStatus,
      internal_notes,
    },
  };
}

export { TRUST_LEVELS, PUBLIC_STATUSES, ENTITY_STATUSES };
