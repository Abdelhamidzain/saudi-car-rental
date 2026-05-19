# 06 — Lead Management Workflow

## Lead Creation

When customer submits form:
1. Validate fields server-side.
2. Check consent.
3. Create lead record.
4. Generate lead number.
5. Create activity log: Lead created.
6. Show success message to customer.

Success message should say:
- Request received.
- Rental company will contact customer directly.
- Price and availability will be confirmed by company.

## Lead Form Fields

Required:
- customer_phone
- city
- pickup_date
- return_date
- category or selected_offer
- request_type

Optional:
- customer_name
- pickup_location
- notes

Hidden/automatic:
- source_page
- UTM parameters
- selected_car_id
- selected_company_id
- selected_offer_id

## Lead Routing

### selected_offer

If customer selects specific offer:
- Assign selected company/branch.
- Generate WhatsApp message with selected offer data.

### best_offer

If customer requests best offer:
- Admin manually selects suitable company in MVP.
- Future AI/n8n suggests best companies based on internal score.

## WhatsApp Message Generation

Message must be generated from stored lead data.

The admin should not manually type full messages.

Dashboard buttons:
- Copy WhatsApp Message
- Open WhatsApp with prefilled message

## Lead Status Flow

Recommended MVP flow:
- new
- reviewed
- sent_to_company
- company_replied
- customer_contacted
- closed_won
- closed_lost
- spam
- duplicate

## Activity Log

Every status change creates activity log.

Examples:
- Status changed from new to reviewed.
- Assigned to Company X.
- WhatsApp message copied.
- Sent to Company X.
- Customer follow-up added.
- Lead closed as won.

## Duplicate Detection

When a new lead is created, check:
- Same phone in last 24 hours.
- Same phone + same city + same dates.
- Same phone submitted multiple selected offers.

Do not block automatically in MVP.
Show warning to admin.

## Lead Quality

Internal score only:
- High intent
- Medium intent
- Low intent

Do not show customer or company negative labels publicly.
