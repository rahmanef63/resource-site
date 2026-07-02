"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import type { Id } from "@convex/_generated/dataModel"

import InventoryPage from "../views/InventoryPage"

const _wsId = "ws_demo" as unknown as Id<"workspaces">

function InventoryPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Inventory</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Items · stock · warehouses · purchase orders
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <InventoryPage workspaceId={_wsId} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "inventory",
  name: "Inventory",
  description: "ERP inventory: items, stock levels, warehouses, suppliers, purchase orders, transfers.",
  component: InventoryPreview,
  category: "inventory",
  tags: ["inventory", "warehouse", "stock", "erp"],
  mockDataSets: [
    {
      id: "default",
      name: "Empty inventory dashboard",
      description: "Real InventoryPage scaffold with zero-state cards and 8-tab nav.",
      data: {},
    },
  ],
})
