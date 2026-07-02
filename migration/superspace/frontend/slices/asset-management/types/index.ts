import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

// ---------------------------------------------------------------------------
// Const tuples
// ---------------------------------------------------------------------------

export const ASSET_STATUSES = ["active", "maintenance", "retired", "lost"] as const
export type AssetStatus = (typeof ASSET_STATUSES)[number]

export const DEPRECIATION_METHODS = ["straight-line", "declining-balance", "none"] as const
export type DepreciationMethod = (typeof DEPRECIATION_METHODS)[number]

export const TRANSACTION_TYPES = [
  "purchase",
  "transfer",
  "maintenance",
  "depreciation",
  "retirement",
  "revaluation",
] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

export interface ManagedAsset extends Omit<BaseEntity, "id"> {
  _id: Id<"managedAssets">
  workspaceId: Id<"workspaces">
  branchId?: string
  name: string
  category: string
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number
  currentValue?: number
  depreciationMethod?: DepreciationMethod
  usefulLifeYears?: number
  status: AssetStatus
  location?: string
  assignedTo?: Id<"users">
  notes?: string
  photos?: string[]
}

export interface AssetTransaction {
  _id: Id<"assetTransactions">
  workspaceId: Id<"workspaces">
  assetId: Id<"managedAssets">
  type: TransactionType
  amount?: number
  date: string
  notes?: string
  performedBy: Id<"users">
  createdAt: number
}

export interface AssetSummary {
  total: number
  active: number
  maintenance: number
  retired: number
  totalCurrentValue: number
  totalPurchaseValue: number
}

// An asset returned by `getAsset` includes its last 50 transactions (desc).
export type ManagedAssetWithTransactions = ManagedAsset & {
  transactions: AssetTransaction[]
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/**
 * Parse a multiline/comma-separated string of URLs into a deduplicated list.
 * Empty input returns undefined so optional fields stay omitted.
 */
const photosStringSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined
    const urls = value
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
    return urls.length > 0 ? Array.from(new Set(urls)) : undefined
  })
  .pipe(
    z
      .array(z.string().url("Each photo must be a valid URL"))
      .optional(),
  )

export const registerAssetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce
    .number()
    .nonnegative("Purchase price cannot be negative")
    .optional(),
  depreciationMethod: z.enum(DEPRECIATION_METHODS).optional(),
  usefulLifeYears: z.coerce
    .number()
    .positive("Useful life must be > 0")
    .optional(),
  location: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  photos: photosStringSchema,
  branchId: z.string().optional(),
})

export type RegisterAssetInput = z.infer<typeof registerAssetSchema>

export const transferAssetSchema = z.object({
  toLocation: z.string().optional(),
  toAssignee: z.string().optional(),
  notes: z.string().optional(),
})

export type TransferAssetInput = z.infer<typeof transferAssetSchema>

export const retireAssetSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
})

export type RetireAssetInput = z.infer<typeof retireAssetSchema>

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  active: "Active",
  maintenance: "Maintenance",
  retired: "Retired",
  lost: "Lost",
}

export const DEPRECIATION_METHOD_LABELS: Record<DepreciationMethod, string> = {
  "straight-line": "Straight-line",
  "declining-balance": "Declining balance",
  none: "None",
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  purchase: "Purchase",
  transfer: "Transfer",
  maintenance: "Maintenance",
  depreciation: "Depreciation",
  retirement: "Retirement",
  revaluation: "Revaluation",
}
