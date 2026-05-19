# 30 — AI Context Refresh Summary

Use this file when the AI has limited context and needs a quick refresh.

## One-Paragraph Summary

This project is a Saudi car rental comparison and lead generation platform. In the MVP, customers compare offers and submit requests, but the platform does not process bookings or payments. Leads are saved in a database, reviewed manually by admin, routed manually to the selected or most suitable rental company through WhatsApp, and then tracked through company follow-up and customer follow-up. The long-term goal is to add company dashboards, automation through n8n/WhatsApp API, social media lead generation, mobile app, and possibly booking/payment in a far future phase.

## Absolute Rules

- No booking/payment in MVP.
- No final price guarantee.
- Use starts-from prices.
- Company contacts customer directly.
- Save all leads.
- Log all lead actions with date/time.
- Admin dashboard first.
- Company dashboard later.
- Do not show negative trust labels publicly.
- Use internal score only for ranking/routing.
- Manual first, automation later.

## Current Priority

Build:
1. Database.
2. Admin dashboard.
3. Lead management.
4. Companies/branches/cars/offers CRUD.
5. WhatsApp message generator.
6. Company follow-up.
7. Customer follow-up.
8. Activity log.
