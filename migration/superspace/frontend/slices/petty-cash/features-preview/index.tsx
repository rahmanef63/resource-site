"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { RequestStatsCards } from "../components/RequestStatsCards"
import { RequestList } from "../components/RequestList"
import type { PettyCashRequest, PettyCashSummary } from "../types"

const _id = (raw: string) => raw as unknown as PettyCashRequest["_id"]
const _wsId = "ws_demo" as unknown as PettyCashRequest["workspaceId"]
const _userId = "user_demo" as unknown as PettyCashRequest["requesterId"]
const NOW = Date.now()

const MOCK_REQUESTS: PettyCashRequest[] = [
  {
    _id: _id("p_1"), workspaceId: _wsId, branchId: "main", requesterId: _userId,
    amount: 250_000, currency: "IDR",
    purpose: "Cleaning supplies — main branch",
    category: "Supplies",
    status: "pending",
    createdAt: NOW - 3_600_000 * 6, updatedAt: NOW - 3_600_000 * 6,
  },
  {
    _id: _id("p_2"), workspaceId: _wsId, branchId: "main", requesterId: _userId,
    amount: 1_500_000, currency: "IDR",
    purpose: "Customer entertainment — VIP visit",
    category: "Marketing",
    status: "approved",
    approverId: _userId, approvedAt: NOW - 86_400_000,
    createdAt: NOW - 86_400_000 * 2, updatedAt: NOW - 86_400_000,
  },
  {
    _id: _id("p_3"), workspaceId: _wsId, branchId: "south-bay", requesterId: _userId,
    amount: 450_000, currency: "IDR",
    purpose: "Emergency plumbing parts",
    category: "Maintenance",
    status: "disbursed",
    approverId: _userId, approvedAt: NOW - 86_400_000 * 3,
    createdAt: NOW - 86_400_000 * 4, updatedAt: NOW - 86_400_000 * 3,
  },
  {
    _id: _id("p_4"), workspaceId: _wsId, branchId: "main", requesterId: _userId,
    amount: 320_000, currency: "IDR",
    purpose: "Coffee beans top-up",
    category: "Inventory",
    status: "closed",
    approverId: _userId, approvedAt: NOW - 86_400_000 * 7,
    closedAt: NOW - 86_400_000 * 5, closedBy: _userId,
    createdAt: NOW - 86_400_000 * 8, updatedAt: NOW - 86_400_000 * 5,
  },
]

const MOCK_SUMMARY: PettyCashSummary = {
  pending:    MOCK_REQUESTS.filter((r) => r.status === "pending").length,
  approved:   MOCK_REQUESTS.filter((r) => r.status === "approved").length,
  disbursed:  MOCK_REQUESTS.filter((r) => r.status === "disbursed").length,
  closed:     MOCK_REQUESTS.filter((r) => r.status === "closed").length,
  rejected:   MOCK_REQUESTS.filter((r) => r.status === "rejected").length,
  outstandingAmount: MOCK_REQUESTS
    .filter((r) => r.status === "approved" || r.status === "disbursed")
    .reduce((s, r) => s + r.amount, 0),
  totalClosedAmount: MOCK_REQUESTS
    .filter((r) => r.status === "closed")
    .reduce((s, r) => s + r.amount, 0),
}

function PettyCashPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Petty Cash</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_SUMMARY.pending} pending · {MOCK_SUMMARY.approved + MOCK_SUMMARY.disbursed} active
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <RequestStatsCards summary={MOCK_SUMMARY} />
      <RequestList items={MOCK_REQUESTS} onSelect={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "petty-cash",
  name: "Petty Cash",
  description: "Request → approve → disburse → close lifecycle for small expenses.",
  component: PettyCashPreview,
  category: "finance",
  tags: ["petty-cash", "expenses", "approval", "disbursement"],
  mockDataSets: [
    {
      id: "default",
      name: "Operational expenses",
      description: "Mix of pending, approved, disbursed, and closed petty-cash requests.",
      data: { requests: MOCK_REQUESTS, summary: MOCK_SUMMARY },
    },
  ],
})
