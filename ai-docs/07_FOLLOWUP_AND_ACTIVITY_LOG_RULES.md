# 07 — Follow-up and Activity Log Rules

## Two Follow-up Types

The system must track both:

1. Company follow-up.
2. Customer follow-up.

Company follow-up alone is not enough.

Customer follow-up is critical to know the real experience.

## Company Follow-up

Purpose:
- Did company receive the lead?
- Did company respond?
- Was the car available?
- Did company contact customer?
- Did company offer alternative?
- Did company confirm price?

Fields:
- company_response_status
- company_response_at
- company_confirmed_price
- company_alternative_offer
- company_notes
- contacted_customer boolean

## Customer Follow-up

Purpose:
- Did company actually contact the customer?
- Was price close to displayed price?
- Did customer receive an offer?
- Did customer rent?
- Was experience good or bad?

Fields:
- customer_followup_status
- customer_contacted_at
- did_company_contact_customer
- did_customer_receive_offer
- price_match_status
- customer_outcome
- customer_rating
- customer_feedback
- next_followup_at

## Manual Customer Follow-up Message

Arabic message:

السلام عليكم، معك فريق منصة مقارنة تأجير السيارات.

حبيت أتأكد فقط هل تواصلت معك شركة التأجير بخصوص طلبك؟
وهل كان السعر أو العرض مناسب لك؟

رأيك يهمنا لتحسين جودة الشركات والعروض المعروضة.

Short version:

السلام عليكم، حبيت أتأكد هل تواصلت معك شركة التأجير بخصوص طلبك؟ وهل كانت التجربة مناسبة لك؟

## Activity Log Rules

Activity logs are mandatory.

Every major action must be logged:
- Lead created.
- Lead reviewed.
- Lead assigned.
- WhatsApp message copied/opened.
- Sent to company.
- Company follow-up added.
- Customer follow-up added.
- Status changed.
- Lead closed.
- Manual note added.

## Activity Log Format

Each log should include:
- event_type
- title
- description
- actor_type
- actor_id
- created_at UTC
- metadata_json

## Dashboard Display

Display as a timeline.

Example:
19 May 2026 — 02:23 PM
Lead sent to company
Admin sent the request manually to Company X WhatsApp number.

Timezone:
- Store UTC.
- Display Asia/Riyadh.

## Why It Matters

These logs help calculate:
- Time to send lead.
- Company response speed.
- Follow-up delays.
- Company reliability.
- Price accuracy.
- Customer satisfaction.
