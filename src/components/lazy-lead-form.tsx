'use client'
import dynamic from 'next/dynamic'

// FIX: Lazy-load the form to reduce initial JS bundle
// The form is below-the-fold on mobile and not needed for FCP/LCP
// This defers React hydration cost until the form is needed
const LeadForm = dynamic(() => import('./lead-form').then(m => ({ default: m.LeadForm })), {
  ssr: true, // Keep SSR for SEO (form HTML is still server-rendered)
  loading: () => (
    <div className="glass-form" aria-label="جاري تحميل النموذج" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.875rem'}}>جاري التحميل...</div>
    </div>
  ),
})

export function LazyLeadForm() {
  return <LeadForm />
}
