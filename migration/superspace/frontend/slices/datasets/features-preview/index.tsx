"use client"

import * as React from "react"
import { Database } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"

function DatasetsPreview() {
  return (
    <div className="space-y-2 p-4 text-sm">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-indigo-600" />
        <span className="font-medium">Datasets</span>
      </div>
      <p className="text-muted-foreground">
        Define a schema once, feed it from anywhere — UI form, weekly ETL,
        external API push, or remote-Convex pull. Generic for any business.
      </p>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "datasets",
  name: "Datasets",
  description: "Generic data containers — schema-driven, multi-source.",
  component: DatasetsPreview,
  category: "administration",
  mockDataSets: [
    {
      id: "default",
      name: "Default",
      description: "Static preview — no live data.",
      data: {},
    },
  ],
})
