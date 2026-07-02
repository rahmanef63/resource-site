import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

export const SCOPES = ["opening", "closing", "shift-change", "audit", "custom"] as const
export type Scope = (typeof SCOPES)[number]

export const SCOPE_LABELS: Record<Scope, string> = {
  opening: "Opening",
  closing: "Closing",
  "shift-change": "Shift change",
  audit: "Audit",
  custom: "Custom",
}

export const RUN_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "review",
  "approved",
  "failed",
] as const
export type RunStatus = (typeof RUN_STATUSES)[number]

export const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  review: "In review",
  approved: "Approved",
  failed: "Failed",
}

// Entity types --------------------------------------------------------------

export interface ChecklistItem {
  id: string
  label: string
  order: number
  required: boolean
  photoRequired?: boolean
  notesRequired?: boolean
}

export interface ChecklistTemplate extends Omit<BaseEntity, "id"> {
  _id: Id<"checklistTemplates">
  workspaceId: Id<"workspaces">
  branchId?: string
  name: string
  description?: string
  scope: Scope
  items: ChecklistItem[]
  isActive: boolean
  createdBy: Id<"users">
}

export interface CompletedItem {
  itemId: string
  completed: boolean
  completedAt?: number
  photoUrl?: string
  notes?: string
}

export interface ChecklistRun extends Omit<BaseEntity, "id"> {
  _id: Id<"checklistRuns">
  workspaceId: Id<"workspaces">
  templateId: Id<"checklistTemplates">
  branchId?: string
  runDate: string
  assignedTo?: Id<"users">
  completedItems: CompletedItem[]
  overallStatus: RunStatus
  reviewedBy?: Id<"users">
  reviewedAt?: number
  reviewNotes?: string
}

// Zod schemas ---------------------------------------------------------------

export const templateItemSchema = z.object({
  label: z.string().min(1, "Item label is required"),
  required: z.boolean(),
  photoRequired: z.boolean().optional(),
  notesRequired: z.boolean().optional(),
})

export type TemplateItemInput = z.infer<typeof templateItemSchema>

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  scope: z.enum(SCOPES),
  description: z.string().optional(),
  branchId: z.string().optional(),
  items: z.array(templateItemSchema).min(1, "Add at least one item"),
})

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>

export const startRunSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  runDate: z.string().min(1, "Run date is required"),
  branchId: z.string().optional(),
  assignedTo: z.string().optional(),
})

export type StartRunInput = z.infer<typeof startRunSchema>

export const reviewRunSchema = z.object({
  approved: z.boolean(),
  reviewNotes: z.string().optional(),
})

export type ReviewRunInput = z.infer<typeof reviewRunSchema>

export const checkItemSchema = z.object({
  itemId: z.string().min(1),
  completed: z.boolean(),
  photoUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().optional(),
})

export type CheckItemInput = z.infer<typeof checkItemSchema>

// Derived helpers -----------------------------------------------------------

/** Count of template items that are required (used to drive run progress). */
export function countRequiredItems(template: ChecklistTemplate | null | undefined): number {
  if (!template) return 0
  return template.items.filter((i) => i.required).length
}

/** Count of run's completed items that match a required item on the template. */
export function countCompletedRequired(
  template: ChecklistTemplate | null | undefined,
  run: ChecklistRun | null | undefined,
): number {
  if (!template || !run) return 0
  const requiredIds = new Set(template.items.filter((i) => i.required).map((i) => i.id))
  return run.completedItems.filter((c) => c.completed && requiredIds.has(c.itemId)).length
}

/** Count of run's completed items (any, including optional). */
export function countCompleted(run: ChecklistRun | null | undefined): number {
  if (!run) return 0
  return run.completedItems.filter((c) => c.completed).length
}
