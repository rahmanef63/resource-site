/**
 * Invoices Overview Component
 * Backend ready via api.features.sales.mutations.createInvoice — UI not yet wired.
 */
"use client"

import React from "react"
import { FeatureNotReady } from "@/frontend/shared/ui/components/feature-not-ready"

interface InvoicesOverviewProps {
  workspaceId?: string | null
}

export default function InvoicesOverview(_props: InvoicesOverviewProps) {
  return (
    <FeatureNotReady
      featureName="Invoices"
      featureSlug="sales"
      status="beta"
      message="Invoice list + create flow sedang dibangun. Backend ready via api.features.sales.mutations.createInvoice."
    />
  )
}
