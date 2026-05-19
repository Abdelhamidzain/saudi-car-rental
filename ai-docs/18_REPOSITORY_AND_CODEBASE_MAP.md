# 18 — Repository and Codebase Map

## Purpose

This file helps any AI assistant understand how the codebase should be structured.

## Current Repository

Repository:
`https://github.com/Abdelhamidzain/saudi-car-rental`

Current app:
- Next.js
- App Router
- TypeScript
- Tailwind
- Static SEO prototype

## Recommended Future Structure

```text
src/
  app/
    page.tsx
    layout.tsx
    sitemap.ts
    robots.ts

    sa/
      [city]/
      [city]/[category]/
      [city]/[category]/[car]/
      airports/[airport]/

    admin/
      layout.tsx
      dashboard/
      leads/
      leads/[id]/
      companies/
      branches/
      cars/
      offers/
      reports/
      settings/

    api/
      leads/
      companies/
      branches/
      cars/
      offers/
      followups/
      activity-logs/

  components/
    public/
    admin/
    forms/
    tables/
    cards/
    layout/

  lib/
    db/
    auth/
    validators/
    services/
    utils/
    seo/
    whatsapp/
    analytics/

  server/
    actions/
    queries/
    mutations/

  types/
    lead.ts
    company.ts
    car.ts
    offer.ts
    user.ts

  styles/
```

## Recommended Service Layer

Use service files for business logic:

```text
lib/services/lead-service.ts
lib/services/company-service.ts
lib/services/offer-service.ts
lib/services/followup-service.ts
lib/services/activity-log-service.ts
lib/services/whatsapp-message-service.ts
lib/services/company-score-service.ts
```

## Important Rule

Do not place business logic directly inside React components.

React components should:
- Display data.
- Submit forms.
- Trigger actions.

Services should:
- Validate.
- Save.
- Update.
- Log.
- Generate messages.
- Apply business rules.

## Current Static Data Migration

Current static data should be moved into:
- database seed files
- admin-editable records
- public queries

Do not keep companies/cars/offers hardcoded long-term.
