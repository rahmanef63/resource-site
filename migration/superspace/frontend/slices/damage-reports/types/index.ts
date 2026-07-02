import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

export const SEVERITIES = ["low", "medium", "high", "critical"] as const
export type Severity = (typeof SEVERITIES)[number]

export const STATUSES = [
  "reported",
  "triaged",
  "investigating",
  "resolved",
  "written-off",
] as const
export type ReportStatus = (typeof STATUSES)[number]

export const RESOLUTIONS = [
  "repaired",
  "replaced",
  "written-off",
  "ignored",
] as const
export type Resolution = (typeof RESOLUTIONS)[number]

export interface DamageReport extends Omit<BaseEntity, "id"> {
  _id: Id<"damageReports">
  workspaceId: Id<"workspaces">
  branchId?: string
  category: string
  severity: Severity
  title: string
  description: string
  photos?: string[]
  location?: string
  relatedEntityType?: string
  relatedEntityId?: string
  reporterId: Id<"users">
  assignedTo?: Id<"users">
  status: ReportStatus
  resolution?: Resolution
  resolvedBy?: Id<"users">
  resolvedAt?: number
  costEstimate?: number
  actualCost?: number
  insuranceClaimRef?: string
  notes?: string
}

export interface DamageReportSummary {
  open: number
  critical: number
  totalCost: number
  total: number
}

const photosField = z
  .preprocess(
    (v) => {
      if (typeof v === "string") {
        return v
          .split(/\r?\n|,/)
          .map((s) => s.trim())
          .filter(Boolean)
      }
      return v
    },
    z.array(z.string().url("Each photo must be a valid URL")).optional(),
  )

export const createReportSchema = z.object({
  category: z.string().min(1, "Category is required"),
  severity: z.enum(SEVERITIES),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  costEstimate: z.coerce.number().nonnegative("Cost must be ≥ 0").optional(),
  photos: photosField,
  branchId: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

export const STATUS_LABELS: Record<ReportStatus, string> = {
  reported: "Reported",
  triaged: "Triaged",
  investigating: "Investigating",
  resolved: "Resolved",
  "written-off": "Written off",
}

export const RESOLUTION_LABELS: Record<Resolution, string> = {
  repaired: "Repaired",
  replaced: "Replaced",
  "written-off": "Written off",
  ignored: "Ignored",
}
