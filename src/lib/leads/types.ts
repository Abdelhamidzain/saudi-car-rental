/**
 * Shared types for lead creation.
 *
 * RequestType matches the public.request_type enum in the database. Per the
 * current MVP scope, public static pages always submit 'best_offer' — the
 * 'selected_offer' path is reserved for future DB-driven offer pages.
 */

export type RequestType = "best_offer" | "selected_offer";

export type CreateLeadUtm = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
};

/**
 * Payload sent from the form to the createLead server action. All values are
 * raw user input or page-derived context. The server is responsible for
 * normalization, slug → id resolution, and adding consent/IP fields.
 */
export type CreateLeadInput = {
  customer_phone: string;
  city_slug: string;
  pickup_date: string; // 'YYYY-MM-DD'
  return_date: string; // 'YYYY-MM-DD'
  category_slug?: string | null;
  selected_car_slug?: string | null;
  airport_slug?: string | null;
  request_type: RequestType;
  pickup_location?: string | null;
  customer_notes?: string | null;
  source_page: string;
  utm?: CreateLeadUtm | null;
  honey?: string | null;
};

export type CreateLeadError =
  | "validation"
  | "phone_format"
  | "unknown_city"
  | "unknown_category"
  | "unknown_car"
  | "unknown_airport"
  | "server_error";

export type CreateLeadResult =
  | { ok: true; lead_number: string }
  | { ok: false; error: CreateLeadError; message_ar: string };
