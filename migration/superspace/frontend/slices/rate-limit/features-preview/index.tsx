"use client"

import * as React from "react"
import { Gauge } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function RateLimitPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Rate Limit</h3>
        <p className="mt-2 text-xs text-muted-foreground">Convex-backed throttle</p>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
        <Gauge className="h-5 w-5 text-primary" />
        <div className="text-sm">
          <div className="font-medium">Per-key throttle</div>
          <div className="text-xs text-muted-foreground">Atomic Convex check-and-increment, 5-min prune</div>
        </div>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "rate-limit",
  name: "Rate Limit",
  description: "Convex-backed per-key request counter — replaces single-replica in-memory Map.",
  component: RateLimitPreview,
  category: "administration",
  tags: ["infra", "throttle", "backend"],
  mockDataSets: [
    {
      id: "default",
      name: "Throttle preview",
      description: "Static preview of the rate-limit info card.",
      data: {},
    },
  ],
})
