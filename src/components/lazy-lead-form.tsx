'use client'
import dynamic from 'next/dynamic'

type LazyLeadFormProps = {
  selectedCarSlug?: string
  airportSlug?: string
  defaultCategorySlug?: string
}

const LeadForm = dynamic(() => import('./lead-form').then(m => ({ default: m.LeadForm })), {
  ssr: false,
  loading: () => (
    <div className="glass-form" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.875rem'}}>جاري التحميل...</div>
    </div>
  ),
})

export function LazyLeadForm(props: LazyLeadFormProps = {}) {
  return <LeadForm {...props} />
}
