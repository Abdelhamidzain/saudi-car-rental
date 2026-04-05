'use client'
import dynamic from 'next/dynamic'

const LeadForm = dynamic(() => import('./lead-form').then(m => ({ default: m.LeadForm })), {
  ssr: true,
  loading: () => (
    <div className="glass-form" aria-label="جاري تحميل النموذج" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.875rem'}}>جاري التحميل...</div>
    </div>
  ),
})

export function LazyLeadForm() {
  return <LeadForm />
}
