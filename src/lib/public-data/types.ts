/**
 * Shared row types for `src/lib/public-data/*` helpers.
 *
 * These shapes mirror the live DB columns (snake_case). They intentionally
 * EXCLUDE private/admin-only fields:
 *   - companies.internal_notes
 *   - companies.trust_level
 *   - branches.whatsapp_number  ← excluded per Task 6.1 product decision
 *   - row-level status / public_status / approval_status (used in WHERE, not SELECT)
 *   - everything customer-PII (leads, consent_*, customer_phone/name)
 *
 * Task 6.2 will introduce a shape-adapter on top of these to bridge to the
 * legacy camelCase `src/lib/data.ts` API. For now, public-data returns DB
 * shapes verbatim.
 */

export type PublicCity = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  priority: number;
  display_order: number;
  min_price_from: number | null;
  seo_title_ar: string | null;
  seo_description_ar: string | null;
  seo_title_en: string | null;
  seo_description_en: string | null;
};

export type PublicAirport = {
  id: string;
  code: string;
  slug: string;
  city_id: string;
  name_ar: string;
  name_en: string;
  priority: number;
  display_order: number;
  min_price_from: number | null;
  seo_title_ar: string | null;
  seo_description_ar: string | null;
  seo_title_en: string | null;
  seo_description_en: string | null;
};

export type PublicCarCategory = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
};

export type PublicCarTransmission = "automatic" | "manual";

export type PublicCar = {
  id: string;
  slug: string;
  brand: string;
  brand_ar: string;
  model: string;
  model_ar: string;
  year: number | null;
  seats: number | null;
  transmission: PublicCarTransmission | null;
  fuel_type: string | null;
  image_url: string | null;
  description_ar: string | null;
  features_json: unknown | null;
  category: { slug: string; name_ar: string; name_en: string; icon: string | null } | null;
};

/**
 * Public company shape — NO trust_level, NO internal_notes, NO status,
 * NO public_status. The rating_snapshot IS included; it's positive
 * content (ai-docs/01 "Public-facing badges must be positive only").
 */
export type PublicCompany = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  logo_url: string | null;
  website_url: string | null;
  google_maps_url: string | null;
  rating_snapshot: number | null;
  reviews_count_snapshot: number | null;
};

/**
 * Public offer shape.
 *   - branch object intentionally EXCLUDES whatsapp_number (Task 6.1 decision).
 *   - approval/public/status fields are enforced by the WHERE clause and
 *     not surfaced — they're internal moderation flags.
 *   - availability_status is surfaced (minus `unavailable`, which is filtered)
 *     so the page can show "needs confirmation" / "available" cues.
 */
export type PublicOfferAvailability = "available" | "likely_available" | "needs_confirmation";

export type PublicOffer = {
  id: string;
  daily_price_from: number | null;
  weekly_price_from: number | null;
  monthly_price_from: number | null;
  deposit_amount: number | null;
  insurance_included: boolean | null;
  insurance_type: string | null;
  mileage_limit: number | null;
  delivery_available: boolean;
  airport_delivery_available: boolean;
  price_status: "starts_from" | "confirmed" | "needs_confirmation";
  availability_status: PublicOfferAvailability;
  last_updated_at: string | null;
  company: {
    slug: string;
    name_ar: string;
    name_en: string;
    logo_url: string | null;
    rating_snapshot: number | null;
  } | null;
  branch: {
    id: string;
    district: string | null;
    address_ar: string | null;
    // NOTE: whatsapp_number intentionally NOT exposed publicly (Task 6.1 decision).
  } | null;
  car: {
    slug: string;
    brand_ar: string;
    model_ar: string;
    year: number | null;
    image_url: string | null;
  } | null;
  city: { slug: string; name_ar: string } | null;
  airport: { slug: string; name_ar: string; code: string } | null;
};
