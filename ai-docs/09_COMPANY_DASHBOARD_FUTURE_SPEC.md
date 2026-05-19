# 09 — Company Dashboard Future Spec

## Goal

Allow rental companies to manage their own profile, branches, cars, offers, and leads.

This is not MVP. It is Phase 2.

## Company Dashboard Features

Company users can:
- Login.
- View assigned leads.
- Update lead status.
- Add notes.
- Mark customer contacted.
- Mark won/lost.
- Manage company profile.
- Manage branches.
- Manage cars.
- Manage offers and prices.
- See performance metrics.

## Company Roles

- company_owner
- branch_manager
- sales_agent
- viewer

## Lead Visibility

Companies can only see:
- Leads assigned to them.
- Customer data for assigned leads only.

They cannot see:
- Leads assigned to other companies.
- Internal admin notes unless shared.
- Internal company quality score.

## Offer Approval

Company edits may require approval.

Trust logic:
- new_partner: all changes require admin approval.
- verified_partner: some changes require approval.
- trusted_partner: price updates may auto-publish.
- auto_approved_partner: most changes auto-publish.
- blocked: cannot publish.

## Company Performance Dashboard

Show:
- Leads received.
- Leads contacted.
- Won/lost leads.
- Average response time.
- Most requested cars.
- Most requested city/branch.
- Missed leads.
- Price mismatch reports.

## Important Rule

Company dashboard must not weaken platform control.

Admin must always have:
- Full visibility.
- Ability to override.
- Ability to approve/reject.
- Ability to block.
