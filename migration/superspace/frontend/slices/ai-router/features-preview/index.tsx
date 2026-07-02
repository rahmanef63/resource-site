"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function AiRouterPreview(_props: FeaturePreviewProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="text-2xl font-bold">AI Router</div>
      <p className="text-sm text-muted-foreground">
        Routing LLM ber-tier — proxy request ke provider yang tepat sesuai beban tugas.
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <span className="font-semibold">nano</span>
          <span className="text-muted-foreground">Haiku — klasifikasi &amp; tugas ringan</span>
        </div>
        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <span className="font-semibold">mid</span>
          <span className="text-muted-foreground">Sonnet — chat &amp; drafting</span>
        </div>
        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <span className="font-semibold">flagship</span>
          <span className="text-muted-foreground">Opus — reasoning berat</span>
        </div>
        <div className="rounded-md border-l-4 border-primary bg-muted/50 p-3 text-sm">
          💡 Request diproxy lewat OpenRouter. Scaffold non-fungsional hingga action di-wire.
        </div>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "ai-router",
  name: "AI Router",
  description: "Provider-proxy config UI untuk akses LLM ber-tier — nano, mid, flagship.",
  component: AiRouterPreview,
  category: "productivity",
  mockDataSets: [
    {
      id: "ai-router-default",
      name: "Sample tiers",
      description: "The nano / mid / flagship routing tiers with example model bindings.",
      data: {},
    },
  ],
})
