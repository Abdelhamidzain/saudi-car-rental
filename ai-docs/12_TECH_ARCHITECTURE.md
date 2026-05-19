# 12 — Tech Architecture

## Recommended MVP Stack

Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS

Database:
- Supabase PostgreSQL or Neon PostgreSQL

Auth:
- Supabase Auth or Auth.js

Storage:
- Cloudflare R2 or Supabase Storage

Hosting:
- Vercel initially for Next.js ease
- Cloudflare can be used for DNS/CDN
- Cloudflare Pages/Workers possible later if optimized

Analytics:
- Google Search Console
- GA4
- Microsoft Clarity
- Internal event logs

Automation later:
- n8n
- WhatsApp Business API
- AI routing agent

## Important Environment Variables

- NEXT_PUBLIC_SITE_URL
- DATABASE_URL
- AUTH_SECRET
- ADMIN_EMAIL
- STORAGE_BUCKET
- WHATSAPP_PROVIDER_API_KEY future
- N8N_WEBHOOK_SECRET future

## Backend Needs

- Lead creation endpoint/action.
- Lead update.
- Company CRUD.
- Branch CRUD.
- Car CRUD.
- Offer CRUD.
- Follow-up creation.
- Activity log creation.
- WhatsApp message generation.
- CSV export.

## Security

- Validate all inputs server-side.
- Rate limit lead form.
- Honeypot.
- Optional Turnstile.
- Role-based access.
- Protect admin routes.
- Never expose customer data publicly.
- Store logs for sensitive actions.

## Performance

- SEO pages should be server-rendered or statically generated.
- Cache public pages.
- Avoid expensive database queries per request.
- Index database fields used for search/filter.
- Keep forms client-side but submissions server-validated.

## Future Automation Hooks

Prepare for:
- New lead webhook.
- Lead assigned webhook.
- Follow-up due webhook.
- Company no response webhook.
- Social post published webhook.

Do not implement automation before manual workflow is stable.
