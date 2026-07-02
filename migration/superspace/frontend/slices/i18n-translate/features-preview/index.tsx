"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function I18nTranslatePreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">i18n Translate</h3>
        <p className="mt-2 text-xs text-muted-foreground">Google Translate widget</p>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-sm">
        <Languages className="h-3 w-3" />
        ID
        <span className="text-muted-foreground">▾</span>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "i18n-translate",
  name: "i18n Translate",
  description: "Google Translate widget drop-in — drop-in language switcher with no API key.",
  component: I18nTranslatePreview,
  category: "productivity",
  tags: ["i18n", "translate", "library"],
  mockDataSets: [
    {
      id: "default",
      name: "Language dropdown",
      description: "Static preview of the language-switcher trigger.",
      data: {},
    },
  ],
})
