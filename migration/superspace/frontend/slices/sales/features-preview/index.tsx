"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import type { Id } from "@convex/_generated/dataModel"

import SalesPage from "../views/SalesPage"

const _wsId = "ws_demo" as unknown as Id<"workspaces">

function SalesPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Sales</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Quotes · invoices · payments
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <SalesPage workspaceId={_wsId} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "sales",
  name: "Sales",
  description: "ERP sales module — quotes, invoices, payments, and revenue tracking.",
  component: SalesPreview,
  category: "finance",
  tags: ["sales", "invoices", "quotes", "payments", "erp"],
  mockDataSets: [
    {
      id: "default",
      name: "Sales dashboard",
      description: "Real SalesPage with revenue/invoice/payment stat cards.",
      data: {},
    },
  ],
})
