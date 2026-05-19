# 04 — User Roles and Permissions

## Admin-Side Roles

### owner

Full access:
- Manage everything.
- View all leads.
- Manage users.
- Manage billing future.
- Manage system settings.
- Export data.
- Override company permissions.

### admin

Can:
- Manage companies.
- Manage branches.
- Manage cars.
- Manage offers.
- Manage leads.
- Add follow-ups.
- Export operational reports.

Cannot:
- Delete critical system data unless allowed.
- Change owner settings.

### editor

Can:
- Edit public content.
- Edit SEO pages.
- Add cars/offers if allowed.
- Cannot access sensitive lead data unless allowed.

## Future Company Roles

### company_owner

Can:
- Manage company profile.
- Manage branches.
- Manage company users.
- Manage cars/offers.
- View assigned leads.
- View performance.

### branch_manager

Can:
- Manage assigned branch.
- Manage offers for assigned branch.
- View branch leads.

### sales_agent

Can:
- View assigned leads.
- Update lead status.
- Add notes.
- Mark contacted/won/lost.

### viewer

Can:
- View dashboard only.
- Cannot edit.

## Customer Role

No customer account in MVP.

Customer submits lead form only.

Future customer accounts may include:
- Saved searches.
- Follow-up.
- Favorites.
- Booking history if booking is added later.

## Permission Rules

- Company users can never see leads assigned to other companies.
- Companies can never see customer data unless lead is assigned to them.
- Admin can see all leads.
- Sensitive actions must create activity logs.
- Company edits may require approval based on trust level.
