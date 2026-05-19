# 20 — Database Migration and Seed Plan

## Purpose

Guide the transition from static data to database-backed records.

## Migration Goals

Move current hardcoded:
- cities
- airports
- categories
- car models
- companies
- offers/prices

into database tables.

## Seed Files

Recommended seed structure:

```text
db/
  migrations/
  seeds/
    001_cities.ts
    002_airports.ts
    003_categories.ts
    004_cars.ts
    005_companies.ts
    006_branches.ts
    007_offers.ts
```

## Seed Data Rules

Cities:
- Must have slug.
- Must have Arabic and English name.
- Must have priority.
- Must have SEO metadata.

Airports:
- Must link to city.
- Must have code.
- Must have Arabic name.

Categories:
- Must have slug.
- Must have Arabic/English names.
- Must have sort order.

Cars:
- Generic car model data only.
- No company-specific price inside car model.
- Price must live in offers.

Companies:
- Can be created from manual research.
- Must have status.
- Must have trust level.
- Must have internal notes.

Offers:
- Must link company + branch + car + city.
- Must use starts-from pricing.
- Must have last_updated_at.
- Must have approval status.

## Important Migration Rule

Do not keep price directly on generic car model.

Wrong:
```text
Toyota Yaris = 89 SAR/day
```

Correct:
```text
Offer 1 = Toyota Yaris + Company A + Riyadh + starts from 89 SAR/day
Offer 2 = Toyota Yaris + Company B + Riyadh + starts from 95 SAR/day
```

## Data Validation During Seed

Reject records if:
- company has no name
- branch has no WhatsApp
- offer has no company
- offer has no car
- offer has no city
- offer has no last_updated_at
