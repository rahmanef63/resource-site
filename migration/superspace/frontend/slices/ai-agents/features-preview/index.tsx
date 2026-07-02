"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function AiAgentsPreview(_props: FeaturePreviewProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="text-2xl font-bold">Antrean Task Agent</div>
      <p className="text-sm text-muted-foreground">
        Pekerja AI otonom — pantau antrean task dan jejak langkah per run.
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <span>Riset harga pesaing</span>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">running</span>
        </div>
        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <span>Ringkas laporan penjualan</span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">queued</span>
        </div>
        <ul className="list-disc pl-5 text-sm">
          <li>1. Ambil data sumber</li>
          <li>2. Panggil tool analisis</li>
          <li>3. Tulis ringkasan</li>
        </ul>
        <div className="rounded-md border-l-4 border-primary bg-muted/50 p-3 text-sm">
          💡 Scaffold statis — jejak run ditampilkan tanpa panggilan provider/SDK.
        </div>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "ai-agents",
  name: "AI Agents",
  description: "Dashboard pekerja AI otonom — antrean task + jejak langkah per run.",
  component: AiAgentsPreview,
  category: "productivity",
  mockDataSets: [
    {
      id: "ai-agents-default",
      name: "Sample queue",
      description: "A sample task queue showing a running task and a step trace.",
      data: {},
    },
  ],
})
