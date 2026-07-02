"use client"

import React, { useMemo, useState } from "react"
import { Award } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCustomerLoyalty,
  useMemberDetail,
} from "../hooks/useCustomerLoyalty"
import { LoyaltyStatsCards } from "../components/LoyaltyStatsCards"
import { MemberList } from "../components/MemberList"
import { TransactionList } from "../components/TransactionList"
import { TierList } from "../components/TierList"
import { EnrollMemberDialog } from "../components/EnrollMemberDialog"
import { UpsertTierDialog } from "../components/UpsertTierDialog"
import { MemberDetailDrawer } from "../components/MemberDetailDrawer"
import { TierDetailDrawer } from "../components/TierDetailDrawer"
import {
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  type LoyaltyMember,
  type LoyaltyTier,
  type LoyaltyTransaction,
  type TransactionType,
} from "../types"

type TopTab = "members" | "transactions" | "tiers"
type TxTypeFilter = "all" | TransactionType

interface CustomerLoyaltyPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function CustomerLoyaltyPage({ workspaceId }: CustomerLoyaltyPageProps) {
  const {
    members,
    tiers,
    summary,
    isLoading,
    enrollMember,
    earnPoints,
    redeemPoints,
    upsertTier,
  } = useCustomerLoyalty(workspaceId)

  const [topTab, setTopTab] = useState<TopTab>("members")

  // Members tab state
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null)

  // Transactions tab state
  const [txTypeFilter, setTxTypeFilter] = useState<TxTypeFilter>("all")
  const [memberSearch, setMemberSearch] = useState("")

  // Tiers tab state
  const [selectedTier, setSelectedTier] = useState<LoyaltyTier | null>(null)

  const memberDetail = useMemberDetail(workspaceId, selectedMember?._id)

  const unifiedTransactions = useMemo<LoyaltyTransaction[]>(() => {
    // Without a dedicated list-transactions query on the backend, we derive
    // a unified cross-member ledger view from the drawer detail when open,
    // falling back to an empty list. The MemberDetailDrawer triggers the
    // per-member fetch; transactions for other members surface as each
    // member is opened. For now: surface nothing when no member is open.
    // (Extending the backend to a workspace-wide list is tracked separately.)
    return memberDetail?.transactions ?? []
  }, [memberDetail])

  const filteredTransactions = useMemo(() => {
    const lowerSearch = memberSearch.trim().toLowerCase()
    return unifiedTransactions.filter((tx) => {
      if (txTypeFilter !== "all" && tx.type !== txTypeFilter) return false
      if (!lowerSearch) return true
      const m = members.find((row) => String(row._id) === String(tx.memberId))
      if (!m) return false
      return (
        m.memberNumber.toLowerCase().includes(lowerSearch) ||
        m.name.toLowerCase().includes(lowerSearch) ||
        (m.email ?? "").toLowerCase().includes(lowerSearch)
      )
    })
  }, [unifiedTransactions, txTypeFilter, memberSearch, members])

  if (!workspaceId) {
    return (
      <FeatureShell featureId="customer-loyalty" padding centered>
        <div className="text-center">
          <Award className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to manage the customer loyalty program.
          </p>
        </div>
      </FeatureShell>
    )
  }

  const inspector =
    topTab === "members" && selectedMember ? (
      <MemberDetailDrawer
        member={memberDetail ?? null}
        onClose={() => setSelectedMember(null)}
        onEarn={earnPoints}
        onRedeem={redeemPoints}
      />
    ) : topTab === "tiers" && selectedTier ? (
      <TierDetailDrawer
        tier={selectedTier}
        allTiers={tiers}
        members={members}
        onClose={() => setSelectedTier(null)}
        onUpsert={async (input) => {
          await upsertTier(input)
          // refresh the selected tier from the latest tiers list
          const updated = tiers.find((t) => String(t._id) === String(selectedTier._id))
          setSelectedTier(updated ?? null)
        }}
      />
    ) : undefined

  const activeTierCount = tiers.filter((t) => t.isActive).length

  return (
    <FeatureShell
      featureId="customer-loyalty"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about members, points balance, tiers, recent earn/redeem activity…"
      inspector={inspector}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <Award className="h-5 w-5" />
              Customer Loyalty
            </h1>
            <p className="text-sm text-muted-foreground">
              Customer loyalty program with tiered memberships and a points transaction ledger.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {topTab === "tiers" ? (
              <UpsertTierDialog onSubmit={upsertTier} />
            ) : (
              <EnrollMemberDialog tiers={tiers} onEnroll={enrollMember} />
            )}
          </div>
        </div>

        <LoyaltyStatsCards summary={summary} />

        <Tabs value={topTab} onValueChange={(v) => setTopTab(v as TopTab)}>
          <TabsList className="inline-flex flex-wrap">
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="tiers">Tiers ({activeTierCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4 flex flex-col gap-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading members…
              </div>
            ) : (
              <MemberList
                items={members}
                onSelect={setSelectedMember}
                emptyAction={<EnrollMemberDialog tiers={tiers} onEnroll={enrollMember} />}
              />
            )}
          </TabsContent>

          <TabsContent value="transactions" className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground" htmlFor="tx-type-filter">
                  Type
                </Label>
                <Select
                  value={txTypeFilter}
                  onValueChange={(v) => setTxTypeFilter(v as TxTypeFilter)}
                >
                  <SelectTrigger id="tx-type-filter" className="h-8 w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TRANSACTION_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground" htmlFor="tx-member-search">
                  Member
                </Label>
                <Input
                  id="tx-member-search"
                  className="h-8 w-[220px]"
                  placeholder="Name / number / email"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
            </div>

            {selectedMember ? (
              <p className="text-[11px] text-muted-foreground">
                Showing ledger for{" "}
                <span className="font-medium">{selectedMember.name}</span>. Close the
                member drawer to clear the filter.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Open a member from the Members tab to load their transaction ledger.
                A workspace-wide transactions feed is on the backend roadmap.
              </p>
            )}

            <TransactionList items={filteredTransactions} members={members} />
          </TabsContent>

          <TabsContent value="tiers" className="mt-4 flex flex-col gap-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading tiers…
              </div>
            ) : (
              <TierList
                items={tiers}
                members={members}
                onSelect={setSelectedTier}
                emptyAction={<UpsertTierDialog onSubmit={upsertTier} />}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FeatureShell>
  )
}
