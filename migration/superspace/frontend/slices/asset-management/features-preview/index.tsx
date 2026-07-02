"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { AssetStatsCards } from "../components/AssetStatsCards"
import { AssetList } from "../components/AssetList"
import type { AssetSummary, ManagedAsset } from "../types"

const _id = (raw: string) => raw as unknown as ManagedAsset["_id"]
const _wsId = "ws_demo" as unknown as ManagedAsset["workspaceId"]

const NOW = Date.now()

const MOCK_ASSETS: ManagedAsset[] = [
  {
    _id: _id("a_1"),
    workspaceId: _wsId,
    branchId: "main",
    name: "Espresso Machine — La Marzocco GS3",
    category: "Equipment",
    serialNumber: "LM-2024-001",
    purchaseDate: "2024-01-15",
    purchasePrice: 145_000_000,
    currentValue: 130_500_000,
    depreciationMethod: "straight-line",
    usefulLifeYears: 7,
    status: "active",
    location: "Bar — Main Counter",
    createdAt: NOW - 86_400_000 * 460,
    updatedAt: NOW - 86_400_000 * 30,
  },
  {
    _id: _id("a_2"),
    workspaceId: _wsId,
    branchId: "main",
    name: "Coffee Grinder — Mahlkönig E80",
    category: "Equipment",
    purchaseDate: "2024-03-02",
    purchasePrice: 38_500_000,
    currentValue: 36_000_000,
    depreciationMethod: "straight-line",
    usefulLifeYears: 5,
    status: "maintenance",
    location: "Bar — Backup Station",
    createdAt: NOW - 86_400_000 * 380,
    updatedAt: NOW - 86_400_000 * 5,
  },
  {
    _id: _id("a_3"),
    workspaceId: _wsId,
    name: "Office Laptop — MacBook Pro 14",
    category: "IT",
    purchaseDate: "2023-11-10",
    purchasePrice: 32_000_000,
    currentValue: 24_000_000,
    depreciationMethod: "straight-line",
    usefulLifeYears: 4,
    status: "active",
    location: "HQ",
    createdAt: NOW - 86_400_000 * 530,
    updatedAt: NOW - 86_400_000 * 60,
  },
]

const MOCK_SUMMARY: AssetSummary = {
  total: MOCK_ASSETS.length,
  active: MOCK_ASSETS.filter((a) => a.status === "active").length,
  maintenance: MOCK_ASSETS.filter((a) => a.status === "maintenance").length,
  retired: MOCK_ASSETS.filter((a) => a.status === "retired").length,
  totalCurrentValue: MOCK_ASSETS.reduce((s, a) => s + (a.currentValue ?? 0), 0),
  totalPurchaseValue: MOCK_ASSETS.reduce((s, a) => s + (a.purchasePrice ?? 0), 0),
}

function AssetManagementPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Asset Management</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_SUMMARY.active} active · 1 in maintenance
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <AssetStatsCards summary={MOCK_SUMMARY} />
      <AssetList items={MOCK_ASSETS} onSelect={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "asset-management",
  name: "Asset Management",
  description: "Track managed assets, depreciation, and asset transaction ledger.",
  component: AssetManagementPreview,
  category: "operations",
  tags: ["assets", "depreciation", "ledger", "inventory"],
  mockDataSets: [
    {
      id: "default",
      name: "Coffee shop assets",
      description: "Three assets across equipment + IT, mix of active and maintenance.",
      data: { assets: MOCK_ASSETS, summary: MOCK_SUMMARY },
    },
  ],
})
