-- =============================================================================
-- Migration: 20260519000017_create_indexes
-- Purpose:   Performance indexes for the most common query patterns.
--
-- Note: Unique indexes for `slug`, `code`, and `lead_number` are already
-- created implicitly by their UNIQUE constraints. They are not repeated here.
-- =============================================================================

-- --- leads -------------------------------------------------------------------

create index idx_leads_status_created_at
  on public.leads (status, created_at desc);

create index idx_leads_customer_phone_created_at
  on public.leads (customer_phone, created_at desc);

create index idx_leads_assigned_company_status
  on public.leads (assigned_company_id, status)
  where assigned_company_id is not null;

create index idx_leads_city_created_at
  on public.leads (city_id, created_at desc);

create index idx_leads_request_type
  on public.leads (request_type);

-- --- offers ------------------------------------------------------------------

create index idx_offers_city_approval_public_status
  on public.offers (city_id, approval_status, public_status, status);

create index idx_offers_company_status
  on public.offers (company_id, status);

create index idx_offers_last_updated_at
  on public.offers (last_updated_at desc nulls last);

create index idx_offers_airport
  on public.offers (airport_id)
  where airport_id is not null;

create index idx_offers_car
  on public.offers (car_id);

-- --- branches ----------------------------------------------------------------

create index idx_branches_company_status
  on public.branches (company_id, status);

create index idx_branches_city_status
  on public.branches (city_id, status);

-- --- cars --------------------------------------------------------------------

create index idx_cars_category_status
  on public.cars (category_id, status);

-- --- airports ----------------------------------------------------------------

create index idx_airports_status_public
  on public.airports (status, public_status, display_order);

create index idx_airports_city
  on public.airports (city_id);

-- --- cities ------------------------------------------------------------------

create index idx_cities_status_public
  on public.cities (status, public_status, display_order);

-- --- companies ---------------------------------------------------------------

create index idx_companies_public_status_trust
  on public.companies (public_status, status, trust_level);

-- --- lead_activity_logs ------------------------------------------------------

create index idx_lal_lead_created_at
  on public.lead_activity_logs (lead_id, created_at desc);

create index idx_lal_event_type
  on public.lead_activity_logs (event_type);

-- --- lead_company_routing ----------------------------------------------------

create index idx_lcr_lead_created_at
  on public.lead_company_routing (lead_id, created_at desc);

create index idx_lcr_company_sent_at
  on public.lead_company_routing (company_id, sent_at desc nulls last);

create index idx_lcr_response_status
  on public.lead_company_routing (company_response_status);

-- --- lead_customer_followups -------------------------------------------------

create index idx_lcf_lead_created_at
  on public.lead_customer_followups (lead_id, created_at desc);

create index idx_lcf_next_followup_at
  on public.lead_customer_followups (next_followup_at)
  where next_followup_at is not null;
