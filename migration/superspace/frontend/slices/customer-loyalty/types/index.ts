import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

// ---------------------------------------------------------------------------
// Const tuples
// ---------------------------------------------------------------------------

export const TRANSACTION_TYPES = ["earn", "redeem", "adjust", "expire"] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  earn: "Earn",
  redeem: "Redeem",
  adjust: "Adjust",
  expire: "Expire",
}

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

export interface LoyaltyMember extends Omit<BaseEntity, "id"> {
  _id: Id<"loyaltyMembers">
  workspaceId: Id<"workspaces">
  contactId?: string
  userId?: Id<"users">
  memberNumber: string
  name: string
  email?: string
  phone?: string
  tier: string
  pointsBalance: number
  totalEarned: number
  totalRedeemed: number
  joinDate: string
  lastActivityAt?: number
  notes?: string
}

export interface LoyaltyTransaction {
  _id: Id<"loyaltyTransactions">
  workspaceId: Id<"workspaces">
  memberId: Id<"loyaltyMembers">
  type: TransactionType
  points: number
  referenceAmount?: number
  reference?: string
  note?: string
  performedBy: Id<"users">
  transactionDate: string
  createdAt: number
}

export interface LoyaltyTier {
  _id: Id<"loyaltyTiers">
  workspaceId: Id<"workspaces">
  name: string
  minPoints: number
  pointsMultiplier: number
  benefits?: string[]
  isActive: boolean
}

export interface LoyaltySummary {
  memberCount: number
  totalPointsOutstanding: number
  totalEarnedLifetime: number
  totalRedeemedLifetime: number
}

export type MemberWithTransactions = LoyaltyMember & {
  transactions: LoyaltyTransaction[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a newline- or comma-separated benefits list into a clean array.
 * Returns undefined for empty input so the optional field stays omitted.
 */
const benefitsStringSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined
    const items = value
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
    return items.length > 0 ? Array.from(new Set(items)) : undefined
  })
  .pipe(z.array(z.string()).optional())

const optionalEmail = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined))
  .pipe(
    z
      .string()
      .email("Must be a valid email address")
      .optional(),
  )

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const enrollMemberSchema = z.object({
  memberNumber: z.string().min(1, "Member number is required"),
  name: z.string().min(1, "Name is required"),
  email: optionalEmail,
  phone: z.string().optional(),
  tier: z.string().optional(),
  joinDate: z.string().optional(),
  contactId: z.string().optional(),
  userId: z.string().optional(),
  notes: z.string().optional(),
})

export type EnrollMemberInput = z.infer<typeof enrollMemberSchema>

export const earnPointsSchema = z.object({
  points: z.coerce.number().positive("Points must be greater than zero"),
  referenceAmount: z
    .union([z.coerce.number(), z.nan(), z.undefined()])
    .optional()
    .transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
  reference: z.string().optional(),
  note: z.string().optional(),
})

export type EarnPointsInput = z.infer<typeof earnPointsSchema>

export const redeemPointsSchema = z.object({
  points: z.coerce.number().positive("Points must be greater than zero"),
  reference: z.string().optional(),
  note: z.string().optional(),
})

export type RedeemPointsInput = z.infer<typeof redeemPointsSchema>

export const upsertTierSchema = z.object({
  name: z.string().min(1, "Tier name is required"),
  minPoints: z.coerce.number().min(0, "Minimum points must be zero or greater"),
  pointsMultiplier: z.coerce
    .number()
    .min(0, "Multiplier must be zero or greater"),
  benefits: benefitsStringSchema,
  isActive: z.boolean().optional().default(true),
})

export type UpsertTierInput = z.infer<typeof upsertTierSchema>
