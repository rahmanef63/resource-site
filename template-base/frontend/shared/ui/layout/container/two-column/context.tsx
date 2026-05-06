/**
 * Two Column Layout Context
 */

"use client"

import * as React from "react"
import type { TwoColumnContextValue } from "./types"

export const TwoColumnContext = React.createContext<TwoColumnContextValue | null>(null)

export function useTwoColumnLayout() {
  const context = React.useContext(TwoColumnContext)
  if (!context) {
    throw new Error("useTwoColumnLayout must be used within TwoColumnLayout")
  }
  return context
}

export function useTwoColumnLayoutSafe() {
  return React.useContext(TwoColumnContext)
}
