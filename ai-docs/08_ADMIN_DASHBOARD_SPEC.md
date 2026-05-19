# 08 — Admin Dashboard Spec

## Goal

The admin dashboard is the operational control center for the MVP.

It must help the founder manage all work manually before automation.

## Main Sections

- Overview
- Leads
- Companies
- Branches
- Cars
- Offers
- Follow-ups
- Reports
- Settings

## Overview Metrics

Show:
- New leads today.
- Leads by city.
- Leads by category.
- Leads sent to companies.
- Leads awaiting follow-up.
- Closed won.
- Closed lost.
- Companies with no response.
- Offers needing price update.

## Leads List

Columns:
- Lead number.
- Created date/time.
- Customer phone.
- City.
- Category/car.
- Request type.
- Assigned company.
- Status.
- Follow-up due.
- Last activity.

Actions:
- View.
- Assign company.
- Copy WhatsApp.
- Open WhatsApp.
- Add follow-up.
- Mark won/lost/spam.

## Single Lead Page

Tabs:
1. Lead Details
2. Company Routing
3. Customer Follow-up
4. Activity Log

## Company Management

Admin can:
- Add/edit company.
- Add logo.
- Add website.
- Add Google Maps URL.
- Add rating snapshot.
- Add internal notes.
- Set trust level.
- Set public status.

## Branch Management

Admin can:
- Add/edit branch.
- Add address.
- Add district.
- Add WhatsApp number.
- Add phone.
- Set working hours.
- Set branch status.

## Cars Management

Admin can:
- Add/edit car.
- Assign category.
- Add model/year/features.
- Add image.
- Set status.

## Offers Management

Admin can:
- Add/edit offer.
- Assign company, branch, car, city.
- Add daily/weekly/monthly price.
- Add deposit.
- Add insurance info.
- Add mileage limit.
- Add airport delivery availability.
- Set price status.
- Set availability status.
- Set approval status.
- Set last updated date.

## Reports

MVP reports:
- Leads by city.
- Leads by source.
- Leads by company.
- Company response rate.
- Customer follow-up outcomes.
- Price mismatch reports.
- Duplicate leads.

## Important UX

Admin should not need to copy data manually.

The dashboard should generate:
- WhatsApp message.
- Lead summary.
- Company summary.
- Customer follow-up notes.
