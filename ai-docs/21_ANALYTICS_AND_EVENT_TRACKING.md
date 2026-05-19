# 21 — Analytics and Event Tracking

## Purpose

The platform must track user behavior and lead quality from day one.

## External Analytics

Use:
- Google Analytics 4
- Google Search Console
- Microsoft Clarity

## Internal Events

Track internally:

### Public Site Events

- page_view
- search_started
- search_filtered
- offer_viewed
- compare_opened
- lead_form_started
- lead_form_submitted
- lead_form_error
- whatsapp_cta_clicked if any
- company_profile_viewed
- airport_page_viewed
- city_page_viewed

### Admin Events

- lead_created
- lead_reviewed
- lead_assigned
- whatsapp_message_copied
- whatsapp_opened
- lead_sent_to_company
- company_followup_added
- customer_followup_added
- lead_closed
- offer_updated
- company_updated

## UTM Tracking

Capture:
- utm_source
- utm_medium
- utm_campaign
- utm_content
- utm_term

Store UTM on lead record.

## Important Reports

- Leads by source.
- Leads by city.
- Leads by category.
- Leads by company.
- Conversion from landing page to lead.
- Search queries with no results.
- Offers with high views but low submissions.
- Social posts that generated leads.

## Future Social Reporting

Each social post should have:
- UTM campaign
- landing page
- platform
- creative type
- generated leads
- lead quality
