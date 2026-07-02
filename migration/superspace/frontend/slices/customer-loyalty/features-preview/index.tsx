"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { LoyaltyStatsCards } from "../components/LoyaltyStatsCards"
import { MemberList } from "../components/MemberList"
import { TierList } from "../components/TierList"
import { TransactionList } from "../components/TransactionList"
import type { LoyaltyMember, LoyaltySummary, LoyaltyTier, LoyaltyTransaction } from "../types"

const _id = (raw: string) => raw as unknown as LoyaltyMember["_id"]
const _txId = (raw: string) => raw as unknown as LoyaltyTransaction["_id"]
const _tierId = (raw: string) => raw as unknown as LoyaltyTier["_id"]
const _wsId = "ws_demo" as unknown as LoyaltyMember["workspaceId"]
const _userId = "user_demo" as unknown as LoyaltyTransaction["performedBy"]
const NOW = Date.now()

const MOCK_TIERS: LoyaltyTier[] = [
  { _id: _tierId("t_bronze"), workspaceId: _wsId, name: "Bronze",   minPoints: 0,    pointsMultiplier: 1.0, benefits: ["Welcome drink"],                isActive: true },
  { _id: _tierId("t_silver"), workspaceId: _wsId, name: "Silver",   minPoints: 500,  pointsMultiplier: 1.2, benefits: ["10% off retail"],               isActive: true },
  { _id: _tierId("t_gold"),   workspaceId: _wsId, name: "Gold",     minPoints: 2000, pointsMultiplier: 1.5, benefits: ["20% off retail", "Free birthday cake"], isActive: true },
]

const MOCK_MEMBERS: LoyaltyMember[] = [
  {
    _id: _id("m_1"), workspaceId: _wsId, memberNumber: "M-0001", name: "Alif Pratama",
    email: "alif@example.com", phone: "+62 812 3456 7890",
    tier: "Gold", pointsBalance: 2_450, totalEarned: 4_120, totalRedeemed: 1_670,
    joinDate: "2024-03-12", lastActivityAt: NOW - 86_400_000 * 2,
    createdAt: NOW - 86_400_000 * 410, updatedAt: NOW - 86_400_000 * 2,
  },
  {
    _id: _id("m_2"), workspaceId: _wsId, memberNumber: "M-0002", name: "Bella Setiawan",
    email: "bella@example.com",
    tier: "Silver", pointsBalance: 720, totalEarned: 1_180, totalRedeemed: 460,
    joinDate: "2025-01-08", lastActivityAt: NOW - 86_400_000 * 6,
    createdAt: NOW - 86_400_000 * 110, updatedAt: NOW - 86_400_000 * 6,
  },
  {
    _id: _id("m_3"), workspaceId: _wsId, memberNumber: "M-0003", name: "Cahya Nugroho",
    tier: "Bronze", pointsBalance: 180, totalEarned: 300, totalRedeemed: 120,
    joinDate: "2026-02-20", lastActivityAt: NOW - 86_400_000 * 14,
    createdAt: NOW - 86_400_000 * 64, updatedAt: NOW - 86_400_000 * 14,
  },
]

const MOCK_TRANSACTIONS: LoyaltyTransaction[] = [
  { _id: _txId("tx_1"), workspaceId: _wsId, memberId: MOCK_MEMBERS[0]._id, type: "earn",   points: 120, referenceAmount: 240_000, reference: "INV-2026-1041", performedBy: _userId, transactionDate: "2026-04-23", createdAt: NOW - 86_400_000 * 2 },
  { _id: _txId("tx_2"), workspaceId: _wsId, memberId: MOCK_MEMBERS[0]._id, type: "redeem", points: 500, reference: "Free latte (5x)", performedBy: _userId, transactionDate: "2026-04-19", createdAt: NOW - 86_400_000 * 6 },
  { _id: _txId("tx_3"), workspaceId: _wsId, memberId: MOCK_MEMBERS[1]._id, type: "earn",   points: 60,  referenceAmount: 120_000, performedBy: _userId, transactionDate: "2026-04-19", createdAt: NOW - 86_400_000 * 6 },
  { _id: _txId("tx_4"), workspaceId: _wsId, memberId: MOCK_MEMBERS[2]._id, type: "earn",   points: 30,  performedBy: _userId, transactionDate: "2026-04-11", createdAt: NOW - 86_400_000 * 14 },
]

const MOCK_SUMMARY: LoyaltySummary = {
  memberCount: MOCK_MEMBERS.length,
  totalPointsOutstanding: MOCK_MEMBERS.reduce((s, m) => s + m.pointsBalance, 0),
  totalEarnedLifetime: MOCK_MEMBERS.reduce((s, m) => s + m.totalEarned, 0),
  totalRedeemedLifetime: MOCK_MEMBERS.reduce((s, m) => s + m.totalRedeemed, 0),
}

function CustomerLoyaltyPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Customer Loyalty</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_SUMMARY.memberCount} members · {MOCK_SUMMARY.totalPointsOutstanding.toLocaleString()} pts outstanding
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <LoyaltyStatsCards summary={MOCK_SUMMARY} />
      <Tabs defaultValue="members" className="flex flex-1 flex-col">
        <TabsList className="flex w-full self-start justify-evenly">
          <TabsTrigger value="members">Members ({MOCK_MEMBERS.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({MOCK_TRANSACTIONS.length})</TabsTrigger>
          <TabsTrigger value="tiers">Tiers ({MOCK_TIERS.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <MemberList items={MOCK_MEMBERS} onSelect={() => { /* preview: no-op */ }} />
        </TabsContent>
        <TabsContent value="transactions" className="mt-4">
          <TransactionList items={MOCK_TRANSACTIONS} members={MOCK_MEMBERS} />
        </TabsContent>
        <TabsContent value="tiers" className="mt-4">
          <TierList items={MOCK_TIERS} members={MOCK_MEMBERS} onSelect={() => { /* preview: no-op */ }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "customer-loyalty",
  name: "Customer Loyalty",
  description: "Members, points ledger, and tier rewards in one place.",
  component: CustomerLoyaltyPreview,
  category: "business",
  tags: ["loyalty", "members", "rewards", "points"],
  mockDataSets: [
    {
      id: "default",
      name: "Coffee shop loyalty program",
      description: "3 members across Bronze/Silver/Gold tiers with recent earn + redeem activity.",
      data: { members: MOCK_MEMBERS, transactions: MOCK_TRANSACTIONS, tiers: MOCK_TIERS, summary: MOCK_SUMMARY },
    },
  ],
})
