'use client'
import dynamic from 'next/dynamic'

const LayoutShell = dynamic(() => import('./layout-inner'), { ssr: false, loading: () => null })
export function ClientShell({ children }: { children: React.ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>
}
