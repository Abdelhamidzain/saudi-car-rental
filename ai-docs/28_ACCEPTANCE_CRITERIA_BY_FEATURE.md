# 28 — Acceptance Criteria by Feature

## Lead Form

Accepted when:
- Valid customer can submit.
- Consent required.
- Lead saved in DB.
- Lead number generated.
- Activity log created.
- Success message shown.
- Invalid data rejected server-side.

## Admin Leads List

Accepted when:
- Admin can see leads.
- Can filter by status/city/company.
- Can open lead detail.
- Shows created date/time.
- Shows last activity.
- Shows follow-up due.

## Lead Detail Page

Accepted when:
- Lead data visible.
- Company routing visible.
- Customer follow-up visible.
- Activity log visible.
- Admin can update status.
- Admin can add notes.

## WhatsApp Message Generation

Accepted when:
- Message generated from lead data.
- Selected offer message includes offer details.
- Best offer message includes request details.
- Admin can copy.
- Admin can open WhatsApp.
- Activity log records copy/open.

## Company Follow-up

Accepted when:
- Admin can add company response.
- Admin can record confirmed price.
- Admin can record unavailable car.
- Admin can record alternative offer.
- Activity log created.

## Customer Follow-up

Accepted when:
- Admin can record customer feedback.
- Admin can record if company contacted customer.
- Admin can record price match.
- Admin can record customer rating.
- Admin can set next follow-up.
- Activity log created.

## Offers

Accepted when:
- Admin can create/edit offer.
- Offer links company + branch + car + city.
- Price is starts-from.
- Last updated date exists.
- Approval status controls visibility.

## Company Pages

Accepted when:
- Public page shows approved data only.
- Does not expose internal trust level.
- Shows positive badges only.
- Shows offers or CTA.
