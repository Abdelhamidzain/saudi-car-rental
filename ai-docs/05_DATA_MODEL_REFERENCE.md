# 05 — Data Model Reference

## Recommended Database

Use PostgreSQL through Supabase or Neon.

Reason:
- Strong relational data model.
- Easier reporting.
- Better dashboard queries.
- Better future scaling for company dashboards.

## Core Tables

### users

- id
- name
- email
- phone
- role
- company_id nullable
- branch_id nullable
- status
- created_at
- updated_at

### companies

- id
- name_ar
- name_en
- slug
- logo_url
- website_url
- google_maps_url
- rating_snapshot
- reviews_count_snapshot
- trust_level
- public_status
- internal_notes
- created_at
- updated_at

Trust levels:
- new_partner
- verified_partner
- trusted_partner
- auto_approved_partner
- blocked

### branches

- id
- company_id
- city
- district
- address_ar
- address_en
- google_maps_url
- phone
- whatsapp_number
- working_hours
- is_main_branch
- status
- created_at
- updated_at

### car_categories

- id
- slug
- name_ar
- name_en
- icon
- sort_order
- status

### cars

- id
- brand
- brand_ar
- model
- model_ar
- slug
- year
- category_id
- seats
- transmission
- fuel_type
- features_json
- image_url
- description_ar
- status
- created_at
- updated_at

### offers

- id
- company_id
- branch_id
- car_id
- city
- airport_code nullable
- daily_price_from
- weekly_price_from
- monthly_price_from
- deposit_amount
- insurance_included
- insurance_type
- mileage_limit
- delivery_available
- airport_delivery_available
- price_status
- availability_status
- approval_status
- last_updated_at
- status
- created_at
- updated_at

price_status:
- starts_from
- confirmed
- needs_confirmation

availability_status:
- available
- likely_available
- needs_confirmation
- unavailable

approval_status:
- pending_review
- approved
- rejected
- auto_approved

### leads

- id
- lead_number
- customer_name nullable
- customer_phone
- city
- pickup_location nullable
- pickup_date
- return_date
- rental_days
- category_id nullable
- selected_car_id nullable
- selected_company_id nullable
- selected_offer_id nullable
- request_type
- source_page
- utm_source
- utm_medium
- utm_campaign
- lead_intent_score
- status
- assigned_company_id nullable
- assigned_branch_id nullable
- assigned_whatsapp nullable
- admin_notes
- created_at
- updated_at

request_type:
- selected_offer
- best_offer

lead_intent_score:
- high
- medium
- low

status:
- new
- reviewed
- sent_to_company
- company_replied
- customer_contacted
- closed_won
- closed_lost
- spam
- duplicate

### lead_company_routing

- id
- lead_id
- company_id
- branch_id
- whatsapp_number
- generated_message
- sent_by_user_id
- sent_at
- company_response_status
- company_confirmed_price nullable
- company_alternative_offer nullable
- company_notes
- created_at
- updated_at

company_response_status:
- not_sent
- sent
- replied
- no_response
- rejected
- unavailable
- alternative_offered
- contacted_customer
- deal_done
- deal_lost

### lead_customer_followups

- id
- lead_id
- contacted_by_user_id
- followup_channel
- customer_followup_status
- price_match_status
- customer_outcome
- customer_rating nullable
- customer_feedback
- next_followup_at nullable
- created_at
- updated_at

followup_channel:
- phone
- whatsapp
- other

price_match_status:
- matched
- close
- different
- unknown

customer_outcome:
- waiting
- contacted_by_company
- not_contacted_by_company
- received_offer
- price_changed
- rented_successfully
- did_not_rent
- bad_experience
- duplicate_request
- fake_or_invalid_lead

### lead_activity_logs

- id
- lead_id
- event_type
- title
- description
- old_value nullable
- new_value nullable
- actor_type
- actor_id nullable
- created_at UTC
- metadata_json

actor_type:
- system
- admin
- company_user
- customer

### company_quality_metrics

Can be calculated periodically.

- company_id
- response_speed_avg_minutes
- contact_rate
- price_match_rate
- deal_success_rate
- complaint_count
- last_price_update_at
- internal_score
- updated_at

## Timestamp Rule

Store timestamps in UTC.

Display in dashboard using Asia/Riyadh timezone.

## Data Quality Rules

No offer should rank high if:
- price is outdated
- company is unresponsive
- offer is incomplete
- branch WhatsApp is missing
- approval status is not approved

