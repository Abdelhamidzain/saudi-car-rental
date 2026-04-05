'use client'
import dynamic from 'next/dynamic'
const Footer = dynamic(() => import('./footer-inner'), { ssr: false, loading: () => null })
export function ClientFooter() { return <Footer/> }
