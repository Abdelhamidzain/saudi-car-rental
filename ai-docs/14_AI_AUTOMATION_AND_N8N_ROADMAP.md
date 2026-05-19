# 14 — AI Automation and n8n Roadmap

## Automation Principle

Do not automate before manual workflow is understood.

First collect:
- Lead volume.
- Company response behavior.
- Customer feedback.
- Price mismatch patterns.
- Best-performing cities/categories.

## Future n8n Workflows

### New Lead Workflow

Trigger:
- New lead created.

Actions:
- Check request type.
- If selected_offer, identify company.
- If best_offer, suggest top companies.
- Notify admin.
- Optional future: send WhatsApp automatically.

### Company No Response Workflow

Trigger:
- Lead sent to company.
- No response after X minutes/hours.

Actions:
- Notify admin.
- Suggest backup company.
- Mark company response delay.

### Customer Follow-up Workflow

Trigger:
- 24 hours after lead sent.

Actions:
- Send customer follow-up message.
- Ask if company contacted customer.
- Record response.
- Alert admin if bad experience.

### Weekly Report Workflow

Trigger:
- Weekly.

Actions:
- Generate report:
  - Leads by city.
  - Leads by company.
  - Response speed.
  - Won/lost.
  - Price mismatch.
  - Follow-up pending.

## AI Agent Future Roles

### Lead Routing Agent

Suggests best company based on:
- City.
- Car/category.
- Price freshness.
- Internal company score.
- Response speed.
- Availability.
- Company status.

### Customer Follow-up Agent

Summarizes customer feedback and flags issues.

### Content Agent

Generates SEO and social media content ideas.

### Data Quality Agent

Finds missing company/offer data.

## Guardrails

AI must not:
- Invent confirmed prices.
- Promise availability.
- Contact customer without consent.
- Send customer data to unauthorized companies.
- Publish unverified company claims.
