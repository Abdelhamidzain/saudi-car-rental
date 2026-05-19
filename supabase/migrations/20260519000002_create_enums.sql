-- =============================================================================
-- Migration: 20260519000002_create_enums
-- Purpose:   Define all enum types used across the schema.
--
-- These enums are referenced by multiple tables, so they are created up-front
-- in a single migration to keep the dependency graph clean.
-- =============================================================================

-- --- User & access -----------------------------------------------------------

create type public.user_role as enum (
  'owner',
  'admin',
  'editor',
  'viewer',
  'company_owner',
  'branch_manager',
  'sales_agent'
);

create type public.user_status as enum (
  'active',
  'invited',
  'disabled'
);

-- --- Generic record lifecycle ------------------------------------------------

create type public.entity_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.public_status as enum (
  'draft',
  'published',
  'hidden',
  'blocked'
);

-- --- Company trust (internal only — never shown publicly) --------------------

create type public.trust_level as enum (
  'new_partner',
  'verified_partner',
  'trusted_partner',
  'auto_approved_partner',
  'blocked'
);

-- --- Offers ------------------------------------------------------------------

create type public.price_status as enum (
  'starts_from',
  'confirmed',
  'needs_confirmation'
);

create type public.availability_status as enum (
  'available',
  'likely_available',
  'needs_confirmation',
  'unavailable'
);

create type public.approval_status as enum (
  'pending_review',
  'approved',
  'rejected',
  'auto_approved'
);

-- --- Leads -------------------------------------------------------------------

create type public.lead_status as enum (
  'new',
  'reviewed',
  'sent_to_company',
  'company_replied',
  'customer_contacted',
  'closed_won',
  'closed_lost',
  'spam',
  'duplicate'
);

create type public.request_type as enum (
  'selected_offer',
  'best_offer'
);

create type public.lead_intent_score as enum (
  'high',
  'medium',
  'low'
);

-- --- Lead routing (company side) --------------------------------------------

create type public.company_response_status as enum (
  'not_sent',
  'sent',
  'replied',
  'no_response',
  'rejected',
  'unavailable',
  'alternative_offered',
  'contacted_customer',
  'deal_done',
  'deal_lost'
);

-- --- Lead follow-up (customer side) -----------------------------------------

create type public.followup_channel as enum (
  'phone',
  'whatsapp',
  'other'
);

create type public.price_match_status as enum (
  'matched',
  'close',
  'different',
  'unknown'
);

create type public.customer_outcome as enum (
  'waiting',
  'contacted_by_company',
  'not_contacted_by_company',
  'received_offer',
  'price_changed',
  'rented_successfully',
  'did_not_rent',
  'bad_experience',
  'duplicate_request',
  'fake_or_invalid_lead'
);

-- --- Activity log ------------------------------------------------------------

create type public.actor_type as enum (
  'system',
  'admin',
  'company_user',
  'customer'
);
