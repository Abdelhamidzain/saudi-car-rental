'use client'
import { useState, type CSSProperties } from 'react'
import {
  DATE_PRESETS,
  addDays,
  diffDays,
  formatDateDisplay,
  daysLabelAr,
  detectPreset,
  type PresetId,
} from '@/lib/search/date-presets'

type Mode = PresetId | 'custom'

type Props = {
  today: string
  pickup: string
  ret: string
  onChange: (pickup: string, ret: string) => void
  disabled?: boolean
  pickupInputId?: string
  returnInputId?: string
  onPresetChange?: (preset: PresetId | 'custom') => void
  hideLabel?: boolean
}

const chipStyle = (active: boolean, disabled: boolean): CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 999,
  border: `1px solid ${active ? '#D4A853' : 'rgba(255,255,255,0.15)'}`,
  background: active ? 'rgba(212,168,83,0.18)' : 'rgba(255,255,255,0.04)',
  color: active ? '#F0D78C' : 'rgba(255,255,255,0.78)',
  fontSize: '.8rem',
  fontWeight: 700,
  fontFamily: 'inherit',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  transition: 'all .2s',
  whiteSpace: 'nowrap',
})

export function DateRangePicker({
  today,
  pickup,
  ret,
  onChange,
  disabled = false,
  pickupInputId = 'lead-pickup',
  returnInputId = 'lead-return',
  onPresetChange,
  hideLabel = false,
}: Props) {
  // Sticky override only when the user explicitly chose custom (clicked
  // مخصص or hand-edited a date). Otherwise the active preset is derived
  // live from (pickup, ret), so external updates — overnight snap-forward,
  // route navigation, etc — keep the chip in sync.
  const [customOverride, setCustomOverride] = useState(false)
  const detected = detectPreset(today, pickup, ret)
  const mode: Mode = customOverride ? 'custom' : (detected ?? 'custom')

  const days = diffDays(pickup, ret)

  function applyPreset(id: PresetId) {
    const p = DATE_PRESETS.find(x => x.id === id)
    if (!p) return
    setCustomOverride(false)
    onPresetChange?.(id)
    onChange(addDays(today, p.pickupOffset), addDays(today, p.returnOffset))
  }

  function enterCustom() {
    setCustomOverride(true)
    onPresetChange?.('custom')
  }

  function setPickupDate(v: string) {
    setCustomOverride(true)
    onPresetChange?.('custom')
    const nextRet = !ret || ret < v ? v : ret
    onChange(v, nextRet)
  }

  function setReturnDate(v: string) {
    setCustomOverride(true)
    onPresetChange?.('custom')
    onChange(pickup, v)
  }

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {!hideLabel && <label className="form-label" style={{ marginBottom: 0 }}>مدة التأجير</label>}
        {pickup && ret && days > 0 && (
          <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span dir="ltr" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
              {formatDateDisplay(pickup)} <span aria-hidden="true">←</span> {formatDateDisplay(ret)}
            </span>
            <span style={{ color: '#D4A853', fontWeight: 700 }}>{daysLabelAr(days)}</span>
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label="مدة التأجير السريعة"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: mode === 'custom' ? 12 : 0 }}
      >
        {DATE_PRESETS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.id)}
            disabled={disabled}
            aria-pressed={mode === p.id}
            style={chipStyle(mode === p.id, disabled)}
          >
            {p.labelAr}
          </button>
        ))}
        <button
          type="button"
          onClick={enterCustom}
          disabled={disabled}
          aria-pressed={mode === 'custom'}
          style={chipStyle(mode === 'custom', disabled)}
        >
          مخصص
        </button>
      </div>

      {mode === 'custom' && (
        <div className="form-row">
          <div>
            <label htmlFor={pickupInputId} className="form-label">تاريخ الاستلام</label>
            <input
              id={pickupInputId}
              type="date"
              className="form-input"
              min={today}
              value={pickup}
              onChange={e => setPickupDate(e.target.value)}
              style={{ colorScheme: 'dark' }}
              aria-required="true"
              disabled={disabled}
            />
          </div>
          <div>
            <label htmlFor={returnInputId} className="form-label">تاريخ التسليم</label>
            <input
              id={returnInputId}
              type="date"
              className="form-input"
              min={pickup || today}
              value={ret}
              onChange={e => setReturnDate(e.target.value)}
              style={{ colorScheme: 'dark' }}
              aria-required="true"
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  )
}
