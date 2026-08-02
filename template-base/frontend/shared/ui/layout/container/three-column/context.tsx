/**
 * Three Column Layout Context
 */

"use client"

import * as React from "react"
import type { ThreeColumnContextValue } from "./types"

export const ThreeColumnContext = React.createContext<ThreeColumnContextValue | null>(null)

export function useThreeColumnLayout() {
  const context = React.useContext(ThreeColumnContext)
  if (!context) {
    throw new Error("useThreeColumnLayout must be used within ThreeColumnLayoutAdvanced")
  }
  return context
}

export function useThreeColumnLayoutSafe() {
  return React.useContext(ThreeColumnContext)
}
