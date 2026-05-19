# 15 — Social Media Lead Engine

## Goal

Generate leads from social media in addition to SEO.

Future platforms:
- X/Twitter
- Instagram
- TikTok
- Facebook
- Snapchat
- LinkedIn for B2B partnerships

## Social Strategy

Use content to drive users to landing pages.

Every post should have:
- Clear CTA.
- UTM tracking.
- City/category focus if relevant.
- Link to relevant landing page.

## Customer Content Ideas

- Cheapest car rental options in Riyadh this week.
- Best economy cars to rent in Saudi Arabia.
- Airport car rental tips.
- Monthly rental vs daily rental.
- Toyota Yaris vs Hyundai Accent rental comparison.
- Things to check before renting a car.
- Best family rental cars.

## Company Content Ideas

- How rental companies can receive better leads.
- Why updated prices get more requests.
- How fast response improves ranking.
- Partner dashboard coming soon.
- Get more visibility in Riyadh/Jeddah/Dammam.

## Future Bot Capabilities

The future bot can:
- Generate content calendar.
- Generate Arabic captions.
- Generate visual prompts.
- Generate short video scripts.
- Schedule posts.
- Add UTM links.
- Track leads by campaign.
- Recommend best-performing content.

## Social Data Model Future

social_campaigns:
- id
- name
- target_city
- target_category
- objective
- start_date
- end_date
- status

social_posts:
- id
- campaign_id
- platform
- caption
- creative_url
- landing_page_url
- utm_campaign
- scheduled_at
- published_at
- status
- metrics_json

## Important Rules

- Do not spam.
- Follow each platform API rules.
- Do not fake reviews or testimonials.
- Do not use misleading prices.
- Always use starts-from language.
