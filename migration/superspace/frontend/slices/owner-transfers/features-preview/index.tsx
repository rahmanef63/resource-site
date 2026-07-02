"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { TransferList } from "../components/TransferList"
import { TransferStatsCards } from "../components/TransferStatsCards"
import type { OwnerTransfer, OwnerTransferSummary } from "../types"

const _id = (raw: string) => raw as unknown as OwnerTransfer["_id"]
const _wsId = "ws_demo" as unknown as OwnerTransfer["workspaceId"]
const _userId = "user_demo" as unknown as OwnerTransfer["ownerUserId"]

const NOW = Date.now()

const MOCK_TRANSFERS: OwnerTransfer[] = [
  {
    _id: _id("t_1"),
    workspaceId: _wsId,
    branchId: "main",
    type: "inject",
    amount: 50_000_000,
    currency: "IDR",
    fromAccount: "Personal — BCA 1234",
    toAccount: "Business — Mandiri 5678",
    ownerUserId: _userId,
    approvedBy: _userId,
    approvedAt: NOW - 86_400_000 * 2,
    transferDate: new Date(NOW - 86_400_000 * 2).toISOString().slice(0, 10),
    category: "Working capital",
    notes: "Q2 working-capital injection",
    status: "approved",
    createdAt: NOW - 86_400_000 * 3,
    updatedAt: NOW - 86_400_000 * 2,
  },
  {
    _id: _id("t_2"),
    workspaceId: _wsId,
    branchId: "main",
    type: "withdraw",
    amount: 12_500_000,
    currency: "IDR",
    fromAccount: "Business — Mandiri 5678",
    toAccount: "Personal — BCA 1234",
    ownerUserId: _userId,
    transferDate: new Date(NOW - 86_400_000).toISOString().slice(0, 10),
    category: "Owner draw",
    status: "pending",
    createdAt: NOW - 86_400_000,
    updatedAt: NOW - 86_400_000,
  },
  {
    _id: _id("t_3"),
    workspaceId: _wsId,
    type: "loan",
    amount: 75_000_000,
    currency: "IDR",
    fromAccount: "Bank Mandiri",
    toAccount: "Business — Mandiri 5678",
    ownerUserId: _userId,
    approvedBy: _userId,
    approvedAt: NOW - 86_400_000 * 30,
    transferDate: new Date(NOW - 86_400_000 * 30).toISOString().slice(0, 10),
    category: "Equipment financing",
    notes: "Coffee roaster loan, 24-month tenor",
    status: "reconciled",
    reconciledAt: NOW - 86_400_000 * 28,
    createdAt: NOW - 86_400_000 * 31,
    updatedAt: NOW - 86_400_000 * 28,
  },
]

const MOCK_SUMMARY: OwnerTransferSummary = {
  totalWithdraw: MOCK_TRANSFERS.filter((t) => t.type === "withdraw").reduce((s, t) => s + t.amount, 0),
  totalInject:   MOCK_TRANSFERS.filter((t) => t.type === "inject").reduce((s, t) => s + t.amount, 0),
  totalLoan:     MOCK_TRANSFERS.filter((t) => t.type === "loan").reduce((s, t) => s + t.amount, 0),
  totalRepayment: MOCK_TRANSFERS.filter((t) => t.type === "repayment").reduce((s, t) => s + t.amount, 0),
  netOwnerPosition:
    MOCK_TRANSFERS.filter((t) => t.type === "inject" || t.type === "loan").reduce((s, t) => s + t.amount, 0)
    - MOCK_TRANSFERS.filter((t) => t.type === "withdraw" || t.type === "repayment").reduce((s, t) => s + t.amount, 0),
  count: MOCK_TRANSFERS.length,
}

function OwnerTransfersPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Owner Transfers</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_TRANSFERS.length} transfers · 1 pending approval
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <TransferStatsCards summary={MOCK_SUMMARY} />
      <TransferList items={MOCK_TRANSFERS} onSelect={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "owner-transfers",
  name: "Owner Transfers",
  description: "Track owner withdrawals, capital injections, loans, and repayments.",
  component: OwnerTransfersPreview,
  category: "finance",
  tags: ["finance", "owner", "transfers", "capital"],
  mockDataSets: [
    {
      id: "default",
      name: "Coffee shop ledger",
      description: "Mix of approved injection, pending withdrawal, and reconciled loan.",
      data: { transfers: MOCK_TRANSFERS, summary: MOCK_SUMMARY },
    },
  ],
})
