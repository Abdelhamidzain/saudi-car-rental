-- =============================================================================
-- Migration: 20260519000020_create_lead_with_log_rpc
-- Purpose:   Atomic creation of a lead + its first activity_log row.
--
-- Lead creation must always record a matching lead_activity_logs entry with
-- event_type='lead_created'. Doing this as two separate PostgREST calls is
-- fragile (orphan leads if the log insert fails). This function performs
-- both inserts in a single transaction.
--
-- The BEFORE INSERT trigger generate_lead_number fires on the leads insert,
-- so the returned lead_number is guaranteed populated.
--
-- search_path is pinned to public to match the hardening migration (019).
-- =============================================================================

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
  p_log_metadata          jsonb   default null
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
    consent_accepted, consent_text_version, consent_ip
  ) values (
    p_customer_phone, p_city_id, p_pickup_date, p_return_date, p_rental_days,
    p_category_id, p_selected_car_id, p_selected_offer_id, p_selected_company_id,
    p_airport_id, p_pickup_location, p_request_type,
    p_source_page, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term,
    true, p_consent_text_version, p_consent_ip
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
  'Atomically inserts a lead and its first lead_activity_logs row (event_type=lead_created). Returns the generated lead id and lead_number. Called from the public lead-creation server action with the service role.';
