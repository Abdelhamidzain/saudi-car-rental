# 19 — API and Server Actions Spec

## Purpose

Define backend actions needed for the MVP.

Implementation can use:
- Next.js Server Actions
- API Routes
- tRPC
- REST endpoints

The exact method can be chosen later, but behavior must remain consistent.

## Lead Actions

### createLead

Input:
- customer_name optional
- customer_phone required
- city required
- pickup_date required
- return_date required
- category_id optional
- selected_car_id optional
- selected_company_id optional
- selected_offer_id optional
- request_type required
- pickup_location optional
- notes optional
- source_page
- utm_source optional
- utm_medium optional
- utm_campaign optional
- consent required

Behavior:
1. Validate input.
2. Validate consent.
3. Calculate rental days.
4. Detect duplicate warning.
5. Create lead.
6. Create activity log: Lead created.
7. Return lead number and success state.

### assignLeadToCompany

Input:
- lead_id
- company_id
- branch_id
- whatsapp_number
- admin_user_id

Behavior:
1. Validate lead exists.
2. Validate company/branch exists.
3. Assign lead.
4. Generate WhatsApp message.
5. Create routing record.
6. Create activity log: Lead assigned.

### generateWhatsAppMessage

Input:
- lead_id
- company_id/branch_id optional

Output:
- message text
- whatsapp deep link if number exists

Behavior:
- Generate Arabic message from lead data.
- Include lead number.
- Include selected offer if present.
- Include customer phone.
- Include pickup/return dates.
- Include disclaimer that company confirms availability/price.

### markWhatsAppCopied

Input:
- lead_id
- routing_id
- admin_user_id

Behavior:
- Create activity log: WhatsApp message copied.

### markWhatsAppOpened

Input:
- lead_id
- routing_id
- admin_user_id

Behavior:
- Create activity log: WhatsApp opened.

### updateLeadStatus

Input:
- lead_id
- status
- notes optional

Behavior:
- Update status.
- Create activity log with old/new status.

## Company Actions

### createCompany
### updateCompany
### createBranch
### updateBranch
### createCar
### updateCar
### createOffer
### updateOffer

All create/update actions must:
- Validate input.
- Save changes.
- Create activity log if related to a lead or audit log if general admin.
- Respect approval workflow later.

## Follow-up Actions

### addCompanyFollowup

Input:
- lead_id
- routing_id
- status
- confirmed_price optional
- alternative_offer optional
- notes
- admin_user_id

Behavior:
- Save company follow-up.
- Update lead status if needed.
- Create activity log.

### addCustomerFollowup

Input:
- lead_id
- followup_channel
- customer_followup_status
- price_match_status
- customer_outcome
- customer_rating optional
- customer_feedback optional
- next_followup_at optional
- admin_user_id

Behavior:
- Save customer follow-up.
- Update lead status if needed.
- Create activity log.

## Reporting Actions

### getDashboardOverview
### getLeadsByCity
### getLeadsByCompany
### getFollowupsDue
### exportLeadsCsv

## Security Rules

- Admin actions require authenticated admin.
- Company actions require company permissions in future.
- Public lead creation must be rate-limited.
- Public lead creation must validate consent.
