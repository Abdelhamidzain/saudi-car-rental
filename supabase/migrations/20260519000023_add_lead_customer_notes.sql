-- =============================================================================
-- Migration: 20260519000023_add_lead_customer_notes
-- Purpose:   Capture optional Arabic customer notes on every lead.
--
-- Two related changes, kept in the same migration so they ship atomically:
--
--   1. ALTER public.leads:
--        - Add nullable customer_notes text column.
--        - Add CHECK constraint capping it at 500 characters.
--
--   2. Replace create_lead_with_activity_log:
--        - Drop the old 21-parameter signature.
--        - Recreate it with a trailing p_customer_notes default null parameter.
--        - INSERT the value into the new column inside the same transaction
--          as the activity-log entry, matching the atomicity guarantee
--          established in migration 020.
--
-- Code paths that don't pass customer_notes keep working — the new parameter
-- defaults to null, and the column is nullable. Existing rows are unaffected.
--
-- The WhatsApp message builder (src/lib/admin/routing/whatsapp-message.ts)
-- already gates the "ملاحظات العميل" section on input.customer_notes being
-- truthy, so no application code change there is required by this migration.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Column + constraint
-- ---------------------------------------------------------------------------

alter table public.leads
  add column customer_notes text null;

alter table public.leads
  add constraint leads_customer_notes_length
  check (customer_notes is null or char_length(customer_notes) <= 500);

comment on column public.leads.customer_notes is
  'Optional free-text notes submitted by the customer on the public lead form. Sanitized (trimmed, control chars stripped, line breaks normalized) in the application layer before the RPC. Max 500 characters enforced at the DB layer.';

-- ---------------------------------------------------------------------------
-- 2. Recreate create_lead_with_activity_log with p_customer_notes
-- ---------------------------------------------------------------------------
-- Drop by exact 21-arg signature so we don't leave a stale overload behind.

drop function if exists public.create_lead_with_activity_log(
  text, uuid, date, date, int, public.request_type,
  uuid, uuid, uuid, uuid, uuid, text,
  text, text, text, text, text, text,
  text, inet, jsonb
);

create or replace function public.create_lead_with_activity_log(
  p_customer_phone        text,
  p_city_id               uuid,
  p_pickup_date           date,
  p_return_date           date,
  p_rental_days           int,
  p_request_type          public.request_type,
  p_category_id           uuid    default null,
  p_selected_car_id       uuid    default null,
  p_selected_offer_id     uuid    default null,
  p_selected_company_id   uuid    default null,
  p_airport_id            uuid    default null,
  p_pickup_location       text    default null,
  p_source_page           text    default null,
  p_utm_source            text    default null,
  p_utm_medium            text    default null,
  p_utm_campaign          text    default null,
  p_utm_content           text    default null,
  p_utm_term              text    default null,
  p_consent_text_version  text    default 'v1-2026-05',
  p_consent_ip            inet    default null,
  p_log_metadata          jsonb   default null,
  p_customer_notes        text    default null
)
returns table(lead_id uuid, lead_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
begin
  insert into public.leads (
    customer_phone, city_id, pickup_date, return_date, rental_days,
    category_id, selected_car_id, selected_offer_id, selected_company_id,
    airport_id, pickup_location, request_type,
    source_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    consent_accepted, consent_text_version, consent_ip,
    customer_notes
  ) values (
    p_customer_phone, p_city_id, p_pickup_date, p_return_date, p_rental_days,
    p_category_id, p_selected_car_id, p_selected_offer_id, p_selected_company_id,
    p_airport_id, p_pickup_location, p_request_type,
    p_source_page, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term,
    true, p_consent_text_version, p_consent_ip,
    p_customer_notes
  )
  returning * into v_lead;

  insert into public.lead_activity_logs (
    lead_id, event_type, title, description, actor_type, metadata_json
  ) values (
    v_lead.id, 'lead_created', 'Lead created', null, 'system', p_log_metadata
  );

  return query select v_lead.id, v_lead.lead_number;
end;
$$;

comment on function public.create_lead_with_activity_log is
  'Atomically inserts a lead (incl. optional customer_notes) and its first lead_activity_logs row (event_type=lead_created). Returns the generated lead id and lead_number. Called from the public lead-creation server action with the service role.';
