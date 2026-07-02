import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { Timestamped } from "../../../shared/types"

export const SCORE_CATEGORIES = [
  "revenue",
  "expense",
  "ops",
  "staff",
  "customer",
] as const
export type ScoreCategory = (typeof SCORE_CATEGORIES)[number]

export interface BranchHealthWeights {
  revenue: number
  expense: number
  ops: number
  staff: number
  customer: number
}

export interface BranchHealthMetricsSnapshot {
  revenue?: number
  grossMargin?: number
  attendanceRate?: number
  complaintCount?: number
  damageCount?: number
}

export interface BranchHealthSnapshot extends Timestamped {
  _id: Id<"branchHealthSnapshots">
  workspaceId: Id<"workspaces">
  branchId: string
  capturedAt: number
  period: string
  revenueScore: number
  expenseScore: number
  opsScore: number
  staffScore: number
  customerScore: number
  compositeScore: number
  insights?: string
  insightsModel?: string
  weights: BranchHealthWeights
  metricsSnapshot?: BranchHealthMetricsSnapshot
}

const scoreField = z.coerce
  .number()
  .min(0, "Score must be >= 0")
  .max(100, "Score must be <= 100")

const weightField = z.coerce
  .number()
  .min(0, "Weight must be >= 0")
  .max(1, "Weight must be <= 1")

export const captureSnapshotSchema = z
  .object({
    branchId: z.string().min(1, "Branch ID is required"),
    period: z.string().min(1, "Period is required"),
    revenueScore: scoreField,
    expenseScore: scoreField,
    opsScore: scoreField,
    staffScore: scoreField,
    customerScore: scoreField,
    weights: z.object({
      revenue: weightField,
      expense: weightField,
      ops: weightField,
      staff: weightField,
      customer: weightField,
    }),
    insights: z.string().optional(),
    insightsModel: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const sum =
      val.weights.revenue +
      val.weights.expense +
      val.weights.ops +
      val.weights.staff +
      val.weights.customer
    if (Math.abs(sum - 1) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Weights must sum to 1.0 (got ${sum.toFixed(2)})`,
        path: ["weights"],
      })
    }
  })

export type CaptureSnapshotInput = z.infer<typeof captureSnapshotSchema>

export const SCORE_CATEGORY_LABELS: Record<ScoreCategory, string> = {
  revenue: "Revenue",
  expense: "Expense",
  ops: "Operations",
  staff: "Staff",
  customer: "Customer",
}

export const DEFAULT_WEIGHTS: BranchHealthWeights = {
  revenue: 0.3,
  expense: 0.2,
  ops: 0.2,
  staff: 0.15,
  customer: 0.15,
}

/**
 * Composite score thresholds — used by ScoreBadge + list colour coding.
 *  - >= 80 emerald (healthy)
 *  - >= 60 blue    (steady)
 *  - >= 40 amber   (watch)
 *  - <  40 red     (critical)
 */
export type ScoreTier = "critical" | "watch" | "steady" | "healthy"

export function getScoreTier(composite: number): ScoreTier {
  if (composite >= 80) return "healthy"
  if (composite >= 60) return "steady"
  if (composite >= 40) return "watch"
  return "critical"
}

export const SCORE_TIER_LABELS: Record<ScoreTier, string> = {
  critical: "Critical",
  watch: "Watch",
  steady: "Steady",
  healthy: "Healthy",
}
