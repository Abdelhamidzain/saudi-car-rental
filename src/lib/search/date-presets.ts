export type PresetId = 'today' | 'tomorrow' | 'two-days' | 'week' | 'month'

export interface DatePreset {
  id: PresetId
  labelAr: string
  pickupOffset: number
  returnOffset: number
}

export const DATE_PRESETS: DatePreset[] = [
  { id: 'today',     labelAr: 'اليوم',  pickupOffset: 0, returnOffset: 1  },
  { id: 'tomorrow',  labelAr: 'غدًا',   pickupOffset: 1, returnOffset: 2  },
  { id: 'two-days',  labelAr: 'يومين', pickupOffset: 0, returnOffset: 2  },
  { id: 'week',      labelAr: 'أسبوع', pickupOffset: 0, returnOffset: 7  },
  { id: 'month',     labelAr: 'شهر',   pickupOffset: 0, returnOffset: 30 },
]

export function addDays(ymd: string, days: number): string {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d) + days * 86400000
  const dt = new Date(t)
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export function diffDays(start: string, end: string): number {
  if (!start || !end) return 0
  const [y1, m1, d1] = start.split('-').map(Number)
  const [y2, m2, d2] = end.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000)
}

export function formatDateDisplay(ymd: string): string {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-')
  return `${d}/${m}/${y}`
}

export function daysLabelAr(n: number): string {
  if (n <= 0) return ''
  if (n === 1) return 'يوم واحد'
  if (n === 2) return 'يومان'
  if (n >= 3 && n <= 10) return `${n} أيام`
  return `${n} يوماً`
}

export function detectPreset(today: string, pickup: string, ret: string): PresetId | null {
  if (!today || !pickup || !ret) return null
  for (const p of DATE_PRESETS) {
    if (pickup === addDays(today, p.pickupOffset) && ret === addDays(today, p.returnOffset)) {
      return p.id
    }
  }
  return null
}
