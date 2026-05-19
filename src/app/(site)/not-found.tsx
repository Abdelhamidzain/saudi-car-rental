import Link from 'next/link'
import { SITE_NAME } from '@/lib/data'

export default function NotFound() {
  return (
    <section className="hero" style={{padding:'140px 0 100px',minHeight:'70vh',display:'flex',alignItems:'center'}}>
      <div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container" style={{position:'relative',zIndex:10,textAlign:'center'}}>
        <div style={{fontFamily:"'Cairo',sans-serif",fontSize:'6rem',fontWeight:900,color:'#D4A853',lineHeight:1}}>404</div>
        <h1 className="hero-title" style={{fontSize:'1.5rem',marginTop:16}}>الصفحة غير موجودة</h1>
        <p className="hero-subtitle" style={{maxWidth:500,margin:'16px auto 32px'}}>عذراً، الصفحة التي تبحث عنها غير متوفرة. قد تكون حُذفت أو تغيّر عنوانها. يمكنك البحث عن تأجير سيارات من الصفحة الرئيسية.</p>
        <Link href="/" className="cta-btn" style={{display:'inline-block'}}>العودة للرئيسية ←</Link>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',marginTop:32}}>
          <Link href="/sa/riyadh" style={{color:'rgba(255,255,255,.7)',fontSize:'.85rem',textDecoration:'none'}}>تأجير سيارات الرياض</Link>
          <Link href="/sa/jeddah" style={{color:'rgba(255,255,255,.7)',fontSize:'.85rem',textDecoration:'none'}}>تأجير سيارات جدة</Link>
          <Link href="/sa/dammam" style={{color:'rgba(255,255,255,.7)',fontSize:'.85rem',textDecoration:'none'}}>تأجير سيارات الدمام</Link>
        </div>
      </div>
    </section>
  )
}
