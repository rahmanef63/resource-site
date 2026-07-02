"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { CustomerDetailView } from "../components/CustomerDetailView"
import { CrmRightPanel } from "../components/CrmRightPanel"
import type { Customer } from "../hooks/useCrmCustomers"

const _id = (raw: string) => raw as unknown as Customer["_id"]
const _wsId = "ws_demo" as unknown as Customer["workspaceId"]
const _userId = "user_demo" as unknown as Customer["createdBy"]
const NOW = Date.now()

const MOCK_CUSTOMER: Customer = {
  _id: _id("c_1"),
  workspaceId: _wsId,
  name: "Bella Setiawan",
  email: "bella@kopi-kita.id",
  phone: "+62 812 3456 7890",
  company: "Kopi Kita Sentral",
  status: "customer",
  tags: ["fnb", "enterprise", "expansion"],
  createdBy: _userId,
  assignee: { name: "Alif Pratama" },
  _creationTime: NOW - 86_400_000 * 90,
}

function CrmPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">CRM</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Customer detail · {MOCK_CUSTOMER.tags?.length ?? 0} tags
        </p>
      </div>
    )
  }

  return (
    <div className="grid h-full grid-cols-[1fr_320px] gap-0 overflow-hidden">
      <div className="overflow-auto border-r p-4">
        <CustomerDetailView
          customer={MOCK_CUSTOMER}
          onEdit={() => { /* preview: no-op */ }}
          onDelete={() => { /* preview: no-op */ }}
          isDeleting={false}
        />
      </div>
      <CrmRightPanel
        customer={MOCK_CUSTOMER}
        mode="inspector"
        onModeChange={() => { /* preview: no-op */ }}
        onClose={() => { /* preview: no-op */ }}
      />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "crm",
  name: "CRM",
  description: "Customer detail view + AI-aware inspector pane.",
  component: CrmPreview,
  category: "business",
  tags: ["crm", "customers", "leads", "deals"],
  mockDataSets: [
    {
      id: "default",
      name: "Enterprise customer",
      description: "Kopi Kita Sentral — F&B customer with expansion opportunity.",
      data: { customer: MOCK_CUSTOMER },
    },
  ],
})
