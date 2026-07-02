"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function AiAdminPreview(_props: FeaturePreviewProps) {
  const tabs = ["Providers", "Models", "Instructions", "Skills", "Tools", "Agents"]
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="text-2xl font-bold">AI Admin</div>
      <p className="text-sm text-muted-foreground">
        Konsol operator untuk seluruh AI stack — kelola provider, model, dan agent dari satu tempat.
      </p>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <span
            key={t}
            className="rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="rounded-md border-l-4 border-primary bg-muted/50 p-3 text-sm">
        💡 Setiap slice ai-* membaca registry-nya dari konsol ini saat runtime.
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "ai-admin",
  name: "AI Admin",
  description:
    "Konsol operator untuk AI stack — provider, model, instruksi, skill, tool, dan definisi agent.",
  component: AiAdminPreview,
  category: "administration",
  mockDataSets: [
    {
      id: "ai-admin-default",
      name: "Sample console",
      description: "A sample console showing the provider / model / agent sub-tabs.",
      data: {},
    },
  ],
})
