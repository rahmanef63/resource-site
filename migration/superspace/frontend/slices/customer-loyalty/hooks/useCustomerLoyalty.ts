"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  EarnPointsInput,
  EnrollMemberInput,
  LoyaltyMember,
  LoyaltySummary,
  LoyaltyTier,
  MemberWithTransactions,
  RedeemPointsInput,
  UpsertTierInput,
} from "../types"

/**
 * Customer Loyalty hook.
 *
 * Surfaces the members + points ledger + tiers workflow against the
 * `loyaltyMembers` + `loyaltyTransactions` + `loyaltyTiers` Convex domain.
 */
export function useCustomerLoyalty(
  workspaceId: Id<"workspaces"> | null | undefined,
  options: { tier?: string } = {},
) {
  const membersArgs = workspaceId
    ? { workspaceId, ...(options.tier ? { tier: options.tier } : {}) }
    : "skip"

  const membersQuery = useQuery(
    api.features.customerLoyalty.queries.listMembers,
    membersArgs,
  )

  const tiersQuery = useQuery(
    api.features.customerLoyalty.queries.listTiers,
    workspaceId ? { workspaceId } : "skip",
  )

  const summaryQuery = useQuery(
    api.features.customerLoyalty.queries.getSummary,
    workspaceId ? { workspaceId } : "skip",
  )

  const enrollMutation = useMutation(api.features.customerLoyalty.mutations.enrollMember)
  const earnMutation = useMutation(api.features.customerLoyalty.mutations.earnPoints)
  const redeemMutation = useMutation(api.features.customerLoyalty.mutations.redeemPoints)
  const upsertTierMutation = useMutation(
    api.features.customerLoyalty.mutations.upsertTier,
  )

  const members = useMemo<LoyaltyMember[]>(
    () => ((membersQuery ?? []) as LoyaltyMember[]),
    [membersQuery],
  )
  const tiers = useMemo<LoyaltyTier[]>(
    () => ((tiersQuery ?? []) as LoyaltyTier[]),
    [tiersQuery],
  )
  const summary = summaryQuery as LoyaltySummary | undefined

  const isLoading = workspaceId
    ? membersQuery === undefined ||
      tiersQuery === undefined ||
      summaryQuery === undefined
    : false

  const enrollMember = useCallback(
    async (input: EnrollMemberInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await enrollMutation({
          workspaceId,
          memberNumber: input.memberNumber,
          name: input.name,
          email: input.email,
          phone: input.phone || undefined,
          tier: input.tier || undefined,
          joinDate: input.joinDate || undefined,
          contactId: input.contactId || undefined,
          userId: input.userId ? (input.userId as Id<"users">) : undefined,
        })
        toast({ title: "Member enrolled", description: input.name })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to enroll member"
        toast({ title: "Enroll failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, enrollMutation],
  )

  const earnPoints = useCallback(
    async (memberId: Id<"loyaltyMembers">, input: EarnPointsInput) => {
      if (!workspaceId) return
      try {
        await earnMutation({
          workspaceId,
          memberId,
          points: input.points,
          referenceAmount: input.referenceAmount,
          reference: input.reference || undefined,
          note: input.note || undefined,
        })
        toast({
          title: "Points earned",
          description: `+${input.points.toLocaleString()} pts`,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to earn points"
        toast({ title: "Earn failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, earnMutation],
  )

  const redeemPoints = useCallback(
    async (memberId: Id<"loyaltyMembers">, input: RedeemPointsInput) => {
      if (!workspaceId) return
      try {
        await redeemMutation({
          workspaceId,
          memberId,
          points: input.points,
          reference: input.reference || undefined,
          note: input.note || undefined,
        })
        toast({
          title: "Points redeemed",
          description: `−${input.points.toLocaleString()} pts`,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to redeem points"
        toast({ title: "Redeem failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, redeemMutation],
  )

  const upsertTier = useCallback(
    async (input: UpsertTierInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        await upsertTierMutation({
          workspaceId,
          name: input.name,
          minPoints: input.minPoints,
          pointsMultiplier: input.pointsMultiplier,
          benefits: input.benefits,
        })
        toast({ title: "Tier saved", description: input.name })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save tier"
        toast({ title: "Save failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, upsertTierMutation],
  )

  return {
    members,
    tiers,
    summary,
    isLoading,
    enrollMember,
    earnPoints,
    redeemPoints,
    upsertTier,
  }
}

/**
 * Per-member detail getter — returns the member plus its last 50
 * transactions (descending by date). Used to power the inspector drawer.
 */
export function useMemberDetail(
  workspaceId: Id<"workspaces"> | null | undefined,
  memberId: Id<"loyaltyMembers"> | null | undefined,
) {
  const detailQuery = useQuery(
    api.features.customerLoyalty.queries.getMember,
    workspaceId && memberId ? { workspaceId, memberId } : "skip",
  )
  return detailQuery as MemberWithTransactions | null | undefined
}

export type { LoyaltyMember, LoyaltySummary, LoyaltyTier, MemberWithTransactions }
