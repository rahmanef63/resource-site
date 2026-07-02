import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

export const DIRECTIONS = ["above", "below", "outside-range", "inside-range"] as const
export type Direction = (typeof DIRECTIONS)[number]

export const SEVERITIES = ["info", "warning", "critical"] as const
export type Severity = (typeof SEVERITIES)[number]

export const ACTION_POLICIES = ["notify", "email", "trigger-workflow"] as const
export type ActionPolicy = (typeof ACTION_POLICIES)[number]

export const DIRECTION_LABELS: Record<Direction, string> = {
  above: "Above",
  below: "Below",
  "outside-range": "Outside range",
  "inside-range": "Inside range",
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
}

export const ACTION_POLICY_LABELS: Record<ActionPolicy, string> = {
  notify: "In-app notify",
  email: "Email",
  "trigger-workflow": "Trigger workflow",
}

/** Render a direction + values as human-readable expression. */
export function formatDirectionExpr(
  direction: Direction,
  value1: number,
  value2?: number,
): string {
  switch (direction) {
    case "above":
      return `> ${value1}`
    case "below":
      return `< ${value1}`
    case "outside-range":
      return `< ${value1} or > ${value2 ?? "?"}`
    case "inside-range":
      return `${value1} – ${value2 ?? "?"}`
  }
}

export interface KpiThreshold extends Omit<BaseEntity, "id"> {
  _id: Id<"kpiThresholds">
  workspaceId: Id<"workspaces">
  branchId?: string
  kpiKey: string
  metric: string
  direction: Direction
  value1: number
  value2?: number
  severity: Severity
  actionPolicy: ActionPolicy[]
  isActive: boolean
  createdBy: Id<"users">
}

export interface KpiAlert {
  _id: Id<"kpiAlerts">
  workspaceId: Id<"workspaces">
  thresholdId: Id<"kpiThresholds">
  branchId?: string
  triggeredAt: number
  actualValue: number
  severity: Severity
  resolved: boolean
  resolvedBy?: Id<"users">
  resolvedAt?: number
  resolutionNote?: string
}

export interface KpiSummary {
  activeThresholds: number
  openAlerts: number
  criticalAlerts: number
  totalAlerts: number
}

// Zod schemas ---------------------------------------------------------------

export const defineThresholdSchema = z
  .object({
    kpiKey: z.string().min(1, "KPI key is required"),
    metric: z.string().min(1, "Metric label is required"),
    direction: z.enum(DIRECTIONS),
    value1: z.coerce.number({ message: "Value must be a number" }),
    value2: z
      .union([z.coerce.number(), z.nan(), z.undefined()])
      .optional()
      .transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
    severity: z.enum(SEVERITIES),
    actionPolicy: z
      .array(z.enum(ACTION_POLICIES))
      .min(1, "Pick at least one action policy"),
    branchId: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const isRange = val.direction === "outside-range" || val.direction === "inside-range"
    if (isRange && (val.value2 === undefined || Number.isNaN(val.value2))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value2"],
        message: "Second value is required for range directions",
      })
    }
    if (
      isRange &&
      typeof val.value2 === "number" &&
      typeof val.value1 === "number" &&
      val.value1 >= val.value2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value2"],
        message: "Upper bound must be greater than lower bound",
      })
    }
  })

export type DefineThresholdInput = z.infer<typeof defineThresholdSchema>

export const acknowledgeAlertSchema = z.object({
  resolutionNote: z.string().optional(),
})

export type AcknowledgeAlertInput = z.infer<typeof acknowledgeAlertSchema>
