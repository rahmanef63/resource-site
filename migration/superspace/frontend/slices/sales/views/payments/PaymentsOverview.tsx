/**
 * Payments Overview Component
 * Backend ready via api.features.sales.mutations.recordPayment — UI not yet wired.
 */
"use client"

import React from "react"
import { FeatureNotReady } from "@/frontend/shared/ui/components/feature-not-ready"

interface PaymentsOverviewProps {
  workspaceId?: string | null
}

export default function PaymentsOverview(_props: PaymentsOverviewProps) {
  return (
    <FeatureNotReady
      featureName="Payments"
      featureSlug="sales"
      status="beta"
      message="Payment recording + list sedang dibangun. Backend ready via api.features.sales.mutations.recordPayment."
    />
  )
}
