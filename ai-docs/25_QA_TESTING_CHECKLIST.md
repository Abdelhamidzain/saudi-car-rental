# 25 — QA Testing Checklist

## Purpose

Checklist before launching or after major changes.

## Public Site Testing

- Homepage loads.
- City pages load.
- Airport pages load.
- Category pages load.
- Car pages load.
- Company pages load.
- Search works.
- Compare works.
- Lead form works.
- Form validation works.
- Consent text is visible.
- Price language says starts-from.
- No booking/payment language appears.
- Internal links work.
- Sitemap works.
- Robots works.
- Metadata works.

## Lead Form Testing

Test:
- Missing phone.
- Invalid phone.
- Missing city.
- Missing dates.
- Return date before pickup.
- Missing consent.
- Selected offer request.
- Best offer request.
- UTM capture.
- Source page capture.

Expected:
- Valid lead saved.
- Lead number generated.
- Activity log created.
- Admin can view lead.

## Admin Dashboard Testing

- Login works.
- Leads list works.
- Lead detail page works.
- Assign company works.
- WhatsApp message generates.
- Copy message works.
- Open WhatsApp works.
- Status update works.
- Company follow-up works.
- Customer follow-up works.
- Activity log shows correct time.

## Data Testing

- Company without WhatsApp should warn admin.
- Offer without last updated date should not rank high.
- Inactive offers should not appear publicly.
- Pending offers should not appear unless approved.
- Duplicate lead warning works.

## Security Testing

- Non-admin cannot access admin.
- Public cannot see leads.
- Company future user cannot see other company leads.
- Server validation blocks invalid data.
- Rate limit protects form.

## SEO Testing

- Pages render important content server-side.
- H1 exists.
- FAQ exists.
- Canonical exists.
- Schema valid.
- No important SEO content hidden only behind client-side rendering.
