/**
 * Admin single-lead query with joined references + activity log.
 *
 * Service-role read. Caller must enforce role first.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeadStatus } from "./list-leads";

export type AdminLeadDetail = {
  id: string;
  lead_number: string | null;
  customer_phone: string;
  customer_name: string | null;
  status: LeadStatus;
  request_type: "best_offer" | "selected_offer";
  pickup_date: string;
  return_date: string;
  rental_days: number;
  pickup_location: string | null;
  customer_notes: string | null;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  consent_accepted: boolean;
  consent_text_version: string;
  consent_accepted_at: string;
  consent_ip: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  city: { slug: string; name_ar: string } | null;
  category: { slug: string; name_ar: string } | null;
  selected_car: { slug: string; brand_ar: string; model_ar: string } | null;
  airport: { slug: string; name_ar: string; code: string } | null;
};

export type AdminLeadActivityLogRow = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  old_value: string | null;
  new_value: string | null;
  actor_type: "system" | "admin" | "company_user" | "customer";
  actor_id: string | null;
  metadata_json: unknown;
  created_at: string;
};

export async function getLeadById(id: string): Promise<AdminLeadDetail | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("leads")
    .select(
      [
        "id",
        "lead_number",
        "customer_phone",
        "customer_name",
        "status",
        "request_type",
        "pickup_date",
        "return_date",
        "rental_days",
        "pickup_location",
        "customer_notes",
        "source_page",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "consent_accepted",
        "consent_text_version",
        "consent_accepted_at",
        "consent_ip",
        "admin_notes",
        "created_at",
        "updated_at",
        "city:cities(slug, name_ar)",
        "category:car_categories(slug, name_ar)",
        "selected_car:cars(slug, brand_ar, model_ar)",
        "airport:airports(slug, name_ar, code)",
      ].join(", "),
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as AdminLeadDetail;
}

export async function getLeadActivityLog(leadId: string): Promise<AdminLeadActivityLogRow[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("lead_activity_logs")
    .select("id, event_type, title, description, old_value, new_value, actor_type, actor_id, metadata_json, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getLeadActivityLog] failed", error);
    return [];
  }
  return (data ?? []) as unknown as AdminLeadActivityLogRow[];
}
