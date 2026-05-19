# 13 — Security, Privacy, and Compliance

## Legal Positioning

The platform is a comparison and lead generation platform.

It does not:
- Rent cars directly.
- Process payment.
- Confirm bookings.
- Sign rental contracts.
- Operate transport services.

Rental contract is between customer and rental company.

## Privacy

The platform collects:
- Customer phone number.
- City.
- Pickup/return dates.
- Requested car/category.
- Optional name.
- Optional notes.

Customer data must be protected.

## Consent Text

Add under lead form:

بالضغط على إرسال الطلب، أوافق على مشاركة بيانات طلبي مع شركة التأجير المختارة أو الشركات المناسبة لغرض التواصل وتقديم العرض.

## Required Pages

- Privacy Policy.
- Terms of Use.
- Disclaimer.
- Partner Terms future.
- Data deletion/contact request page future.

## Data Sharing

Customer data can be shared only with:
- Selected rental company.
- Suitable rental company/companies for the submitted request.
- Admin team.

## Security Features

MVP:
- Server-side validation.
- Rate limiting.
- Honeypot.
- Admin auth.
- Activity logs.
- Secure environment variables.

Future:
- OTP verification.
- WhatsApp Business API.
- More advanced fraud detection.
- Audit exports.

## Google Maps and Reviews

Avoid large-scale scraping.

Safer approach:
- Store company Google Maps URL.
- Store manually verified rating snapshot.
- Store review count snapshot.
- Store last verified date.
- Do not copy full review text without permission.

## Disclaimer Language

Use:
- Prices are indicative and start-from.
- Final price and availability are confirmed by rental company.
- Platform is not responsible for final rental agreement.
- Customer contracts directly with rental company.

## Data Retention

Define later:
- How long leads are stored.
- How customers can request deletion.
- Who can access lead data.
