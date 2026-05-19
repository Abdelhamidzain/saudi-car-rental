# 27 — Risk Register

## Risk: Price Mismatch

Problem:
Displayed price differs from company price.

Mitigation:
- Use starts-from language.
- Track price mismatch.
- Add price freshness.
- Lower ranking for repeated mismatch.

## Risk: Company Does Not Respond

Problem:
Customer gets bad experience.

Mitigation:
- Track response.
- Customer follow-up.
- Lower ranking.
- Reassign lead if needed.

## Risk: Weak Leads

Problem:
Companies may not value leads.

Mitigation:
- Validate phone.
- Detect duplicates.
- Track lead intent.
- Follow up outcomes.

## Risk: Legal Mispositioning

Problem:
Platform may look like rental/booking service.

Mitigation:
- Clear disclaimers.
- No booking/payment in MVP.
- Company contacts customer directly.
- Contract is between customer and company.

## Risk: Scraping Problems

Problem:
Using Google reviews/content improperly.

Mitigation:
- Avoid large-scale scraping.
- Store maps URL and manual snapshots.
- Build own customer feedback system.

## Risk: Data Privacy

Problem:
Customer phones are sensitive.

Mitigation:
- Consent.
- Privacy policy.
- Admin access control.
- Do not expose leads publicly.

## Risk: Too Much Automation Too Early

Problem:
Automation fails before manual workflow is understood.

Mitigation:
- Manual first.
- n8n later.
- Use logs to design automation.

## Risk: Companies Abuse Dashboard

Problem:
Companies may enter wrong prices.

Mitigation:
- Approval workflow.
- Trust levels.
- Price mismatch tracking.
- Admin override.
