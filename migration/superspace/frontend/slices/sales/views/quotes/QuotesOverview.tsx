/**
 * Quotes Overview Component
 * Backend ready via api.features.sales.mutations.createQuote — UI not yet wired.
 */
"use client"

import React from "react"
import { FeatureNotReady } from "@/frontend/shared/ui/components/feature-not-ready"

interface QuotesOverviewProps {
  workspaceId?: string | null
}

export default function QuotesOverview(_props: QuotesOverviewProps) {
  return (
    <FeatureNotReady
      featureName="Quotes"
      featureSlug="sales"
      status="beta"
      message="Quote list + create flow sedang dibangun. Backend ready via api.features.sales.mutations.createQuote."
    />
  )
}
