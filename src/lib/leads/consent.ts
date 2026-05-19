/**
 * Canonical consent text shown next to the lead-form submit button.
 *
 * Clicking submit is treated as implicit acceptance of this exact wording.
 * The version string is stored on every lead row so the consent the customer
 * actually accepted can be reconstructed even if this text is changed later.
 *
 * Rules:
 *  - If you change CONSENT_TEXT_AR, bump CONSENT_TEXT_VERSION.
 *  - Old leads keep their original version; this lets legal/audit replay
 *    exactly what the customer saw at the time of submission.
 */

export const CONSENT_TEXT_VERSION = "v1-2026-05";

export const CONSENT_TEXT_AR =
  "بالضغط على إرسال الطلب، أوافق على مشاركة بيانات طلبي مع شركة التأجير " +
  "المختارة أو المناسبة لغرض التواصل وتقديم العرض.";
