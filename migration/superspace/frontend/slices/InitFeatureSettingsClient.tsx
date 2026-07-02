"use client"

import { useEffect } from "react"

export function InitFeatureSettingsClient() {
  useEffect(() => {
    void import("@/frontend/slices/initFeatureSettings")
  }, [])

  return null
}
