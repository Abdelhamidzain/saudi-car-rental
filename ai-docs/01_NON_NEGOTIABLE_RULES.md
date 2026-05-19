# 01 — Non-Negotiable Rules for Any LLM

This file has the highest priority.

Any AI assistant working on the project must follow these rules.

## Product Positioning Rules

### Must Do

The platform must be described as:
- A car rental comparison platform.
- A lead generation platform.
- A request-routing platform.
- A directory/search/comparison experience.

### Must Not Do

Do not describe MVP as:
- A booking platform.
- A payment platform.
- A company that rents cars directly.
- A platform that confirms car availability.
- A platform that guarantees final prices.

## Customer-Facing Language Rules

Use:
- Compare offers.
- Submit your request.
- Starts from.
- The rental company will confirm price and availability.
- The rental company will contact you directly.
- The contract is between customer and rental company.

Avoid:
- Book now, if it implies confirmed booking.
- Pay now.
- Confirmed booking.
- Guaranteed price.
- We will rent you a car.
- Final price.

## Pricing Rules

All prices in MVP must be treated as indicative.

Use:
- starts from
- السعر يبدأ من
- initial price
- price to be confirmed by the company

Never show:
- final confirmed price unless company explicitly confirms it.
- guaranteed availability unless connected to real availability data.

## Trust and Ranking Rules

Do not show negative or weak trust labels publicly.

Do not show:
- Medium trust
- Low trust
- Weak company
- Unreliable company

Use internal scoring only.

Public-facing badges must be positive only:
- Verified
- Fast response
- Updated prices
- Airport delivery available
- Suitable for monthly rental
- Family-friendly options

If a company is weak internally, it should:
- Rank lower.
- Not appear in top suggestions.
- Be hidden from featured areas.
- Be reviewed by admin.

## Lead Handling Rules

Every lead must be saved in the database.

Every major lead action must create an activity log entry with date and time.

Required logs:
- Lead created.
- Lead reviewed.
- Company assigned.
- WhatsApp message copied.
- WhatsApp message opened.
- Sent to company.
- Company follow-up added.
- Customer follow-up added.
- Status changed.
- Lead closed.

## Manual First Rule

Do not automate too early.

MVP must support manual operations first:
- Manual review.
- Manual company assignment.
- Manual WhatsApp sending.
- Manual follow-up.
- Manual lead status updates.

Automation with n8n/WhatsApp API comes later.

## Dashboard Priority Rule

Build admin dashboard first.

Company dashboard comes later.

No company should be allowed to freely publish data without the right approval rules.

## Data Privacy Rules

Customer phone numbers and lead details must not be public.

Customer data can only be shared with:
- Selected company.
- Suitable company/companies for the request.
- Admin team.

A consent statement must be shown under the lead form.

## Claim Company Rule

Do not make “Claim this company profile” public in MVP unless explicitly requested.

It can be kept internal inside admin dashboard first.

## Scraping Rule

Do not recommend large-scale scraping of Google Maps reviews.

Safe approach:
- Store public company information manually or through approved APIs.
- Store Google Maps URL.
- Store rating/review count snapshot if manually verified.
- Do not copy review text directly into the platform.

## Future Booking Rule

Booking/payment is a future phase only.

Do not add booking/payment architecture unless explicitly requested.

## Arabic/English Rule

Customer-facing site starts in Arabic.

LLM/project documentation can be in English to reduce tokens and improve Claude understanding.
