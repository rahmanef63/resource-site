"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function AiStudioPreview(_props: FeaturePreviewProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="text-2xl font-bold">AI Studio</div>
      <p className="text-sm text-muted-foreground">
        Satu prompt besar menghasilkan output streaming — bandingkan variasi lalu telusuri pohon versi.
      </p>
      <div className="rounded-md border bg-muted/40 p-3 text-sm">
        Prompt: &quot;Desain poster promo menu baru, gaya minimalis, warna hangat.&quot;
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="aspect-square rounded-md border bg-gradient-to-br from-primary/20 to-muted" />
        <div className="aspect-square rounded-md border bg-gradient-to-br from-muted to-primary/20" />
        <div className="aspect-square rounded-md border bg-gradient-to-tr from-primary/10 to-muted/60" />
      </div>
      <div className="rounded-md border-l-4 border-primary bg-muted/50 p-3 text-sm">
        💡 Pilih satu variasi untuk bercabang jadi versi baru, atau ubah prompt untuk regenerasi.
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "ai-studio",
  name: "AI Studio",
  description:
    "Kanvas generasi AI — satu prompt besar menghasilkan output streaming dengan grid variasi dan pohon versi.",
  component: AiStudioPreview,
  category: "creativity",
  mockDataSets: [
    {
      id: "ai-studio-default",
      name: "Sample generation",
      description: "A sample prompt with a variation grid and version tree.",
      data: {},
    },
  ],
})
