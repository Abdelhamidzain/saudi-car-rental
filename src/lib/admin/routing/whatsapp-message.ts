/**
 * Pure builder for the Arabic WhatsApp message that admin copies / sends to
 * the rental company.
 *
 * Templates mirror `ai-docs/24_MESSAGING_TEMPLATES.md`:
 *   - Best offer  →  generic request with city + category.
 *   - Selected offer  →  call-out that customer picked the company's specific offer.
 *
 * Current public forms always submit request_type = 'best_offer', so the
 * best-offer template is what gets used in MVP. The selected-offer branch is
 * implemented for forward-compatibility with future DB-driven offer pages.
 *
 * The message must NEVER imply a confirmed booking or a guaranteed final
 * price — the closing line always says "تواصلوا مع العميل لتأكيد التوفر
 * والسعر النهائي".
 */

export type BuildWhatsAppMessageInput = {
  lead_number: string | null;
  request_type: "best_offer" | "selected_offer";
  city_name_ar: string | null;
  category_name_ar: string | null;
  car_name_ar: string | null;          // e.g. "تويوتا يارس"
  pickup_date: string;                 // 'YYYY-MM-DD'
  return_date: string;                 // 'YYYY-MM-DD'
  rental_days: number;
  customer_phone: string;              // already normalized
  pickup_location: string | null;
  customer_notes: string | null;       // not currently captured by the public form
  company_name_ar: string | null;      // for the selected-offer template
  branch_label: string | null;         // district / address / "فرع رئيسي"
};

const DISCLAIMER =
  "فضلاً تواصلوا مع العميل مباشرة لتأكيد التوفر والسعر النهائي.";

function section(lines: (string | null | false | undefined)[]): string {
  return lines.filter(Boolean).join("\n");
}

export function buildWhatsAppMessage(input: BuildWhatsAppMessageInput): string {
  const header = section([
    "طلب تأجير سيارة جديد",
    "",
    input.lead_number ? `رقم الطلب: #${input.lead_number}` : null,
  ]);

  let body: string;

  if (input.request_type === "selected_offer") {
    body = section([
      "",
      "العميل اختار عرضكم:",
      input.company_name_ar ? `الشركة: ${input.company_name_ar}` : null,
      input.branch_label ? `الفرع: ${input.branch_label}` : null,
      input.car_name_ar ? `السيارة: ${input.car_name_ar}` : null,
      input.city_name_ar ? `المدينة: ${input.city_name_ar}` : null,
      "",
      "بيانات الطلب:",
      `تاريخ الاستلام: ${input.pickup_date}`,
      `تاريخ التسليم: ${input.return_date}`,
      `مدة الإيجار: ${input.rental_days} أيام`,
      `رقم العميل: ${input.customer_phone}`,
      input.pickup_location ? `موقع الاستلام: ${input.pickup_location}` : null,
      input.customer_notes ? "" : null,
      input.customer_notes ? "ملاحظات العميل:" : null,
      input.customer_notes,
    ]);
  } else {
    body = section([
      "",
      "نوع الطلب: العميل طلب أفضل عرض مناسب",
      "",
      "بيانات الطلب:",
      input.city_name_ar ? `المدينة: ${input.city_name_ar}` : null,
      input.category_name_ar ? `الفئة المطلوبة: ${input.category_name_ar}` : null,
      input.car_name_ar ? `السيارة المفضلة: ${input.car_name_ar}` : null,
      `تاريخ الاستلام: ${input.pickup_date}`,
      `تاريخ التسليم: ${input.return_date}`,
      `مدة الإيجار: ${input.rental_days} أيام`,
      `رقم العميل: ${input.customer_phone}`,
      input.pickup_location ? `موقع الاستلام: ${input.pickup_location}` : null,
      input.customer_notes ? "" : null,
      input.customer_notes ? "ملاحظات العميل:" : null,
      input.customer_notes,
    ]);
  }

  return section([header, body, "", DISCLAIMER]);
}

/**
 * Build a wa.me deep-link URL for the given E.164 Saudi number + message.
 * Returns null if the number isn't in the expected +9665XXXXXXXX form.
 */
export function buildWhatsAppDeepLink(
  e164Number: string | null,
  message: string,
): string | null {
  if (!e164Number || !/^\+9665\d{8}$/.test(e164Number)) return null;
  const numericOnly = e164Number.replace(/^\+/, "");
  return `https://wa.me/${numericOnly}?text=${encodeURIComponent(message)}`;
}
