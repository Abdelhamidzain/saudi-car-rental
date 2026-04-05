'use client'
import dynamic from 'next/dynamic'

function Inner({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export const NoSSR = dynamic(() => Promise.resolve(Inner), { ssr: false })
