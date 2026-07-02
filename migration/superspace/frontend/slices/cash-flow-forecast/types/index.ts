import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

export const BUCKETS = [
  "recurring-revenue",
  "one-off-revenue",
  "expense-fixed",
  "expense-variable",
  "capex",
] as const
export type Bucket = (typeof BUCKETS)[number]

export const STATUSES = ["draft", "published", "archived"] as const
export type ForecastStatus = (typeof STATUSES)[number]

export const GENERATION_SOURCES = ["manual", "recurring-derived", "ai-assisted"] as const
export type GenerationSource = (typeof GENERATION_SOURCES)[number]

export const BUCKET_LABELS: Record<Bucket, string> = {
  "recurring-revenue": "Recurring revenue",
  "one-off-revenue": "One-off revenue",
  "expense-fixed": "Fixed expense",
  "expense-variable": "Variable expense",
  capex: "Capital expenditure",
}

export const STATUS_LABELS: Record<ForecastStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
}

export const GENERATION_SOURCE_LABELS: Record<GenerationSource, string> = {
  manual: "Manual",
  "recurring-derived": "Recurring-derived",
  "ai-assisted": "AI-assisted",
}

/**
 * Buckets that represent inflow (revenue) — used by drawer grouping and UI tone.
 */
export const REVENUE_BUCKETS: Bucket[] = ["recurring-revenue", "one-off-revenue"]

/**
 * Buckets that represent outflow (expense / capex).
 */
export const EXPENSE_BUCKETS: Bucket[] = ["expense-fixed", "expense-variable", "capex"]

export interface LineItem {
  _id: Id<"cashFlowLineItems">
  workspaceId: Id<"workspaces">
  forecastId: Id<"cashFlowForecasts">
  bucket: Bucket
  label: string
  amount: number
  probability?: number
  expectedDate?: string
  note?: string
}

export interface ForecastSummary extends Omit<BaseEntity, "id"> {
  _id: Id<"cashFlowForecasts">
  workspaceId: Id<"workspaces">
  branchId?: string
  horizonDays: number
  startDate: string
  endDate: string
  baseCash: number
  projectedInflow: number
  projectedOutflow: number
  projectedClosing: number
  confidence?: number
  status: ForecastStatus
  generatedBy: Id<"users">
  generationSource: GenerationSource
  aiNotes?: string
  publishedAt?: number
}

export interface Forecast extends ForecastSummary {
  items: LineItem[]
}

// ---- Zod schemas ------------------------------------------------------------

export const createForecastSchema = z.object({
  horizonDays: z.coerce.number().int().min(1, "Horizon must be at least 1 day"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  baseCash: z.coerce.number(),
  branchId: z.string().optional(),
  generationSource: z.enum(GENERATION_SOURCES).optional(),
  aiNotes: z.string().optional(),
})

export type CreateForecastInput = z.infer<typeof createForecastSchema>

export const addLineItemSchema = z.object({
  bucket: z.enum(BUCKETS),
  label: z.string().min(1, "Label is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  probability: z.coerce
    .number()
    .min(0, "Probability must be between 0 and 1")
    .max(1, "Probability must be between 0 and 1")
    .optional(),
  expectedDate: z.string().optional(),
  note: z.string().optional(),
})

export type AddLineItemInput = z.infer<typeof addLineItemSchema>
