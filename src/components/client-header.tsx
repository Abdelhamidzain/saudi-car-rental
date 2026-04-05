'use client'
import dynamic from 'next/dynamic'
const Header = dynamic(() => import('./header-inner'), { ssr: false, loading: () => <div className="site-header"/> })
export function ClientHeader() { return <Header/> }
