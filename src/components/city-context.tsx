'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'

type CityContextType = {
  selectedCity: string
  setSelectedCity: (city: string) => void
}

const CityContext = createContext<CityContextType>({ selectedCity: '', setSelectedCity: () => {} })

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState('')
  return <CityContext.Provider value={{ selectedCity, setSelectedCity }}>{children}</CityContext.Provider>
}

export function useCity() { return useContext(CityContext) }
