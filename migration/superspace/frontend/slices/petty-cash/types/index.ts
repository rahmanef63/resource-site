import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

export const REQUEST_STATUSES = [
  "pending",
  "approved",
  "disbursed",
  "closed",
  "rejected",
  "cancelled",
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const DISBURSEMENT_METHODS = ["cash", "transfer", "card"] as const
export type DisbursementMethod = (typeof DISBURSEMENT_METHODS)[number]

export interface PettyCashRequest extends Omit<BaseEntity, "id"> {
  _id: Id<"pettyCashRequests">
  workspaceId: Id<"workspaces">
  branchId?: string
  requesterId: Id<"users">
  amount: number
  currency: string
  purpose: string
  category?: string
  notes?: string
  status: RequestStatus
  approverId?: Id<"users">
  approvedAt?: number
  rejectedReason?: string
  disbursementId?: Id<"pettyCashDisbursements">
  closedAt?: number
  closedBy?: Id<"users">
  attachments?: string[]
}

export interface PettyCashDisbursement {
  _id: Id<"pettyCashDisbursements">
  workspaceId: Id<"workspaces">
  requestId: Id<"pettyCashRequests">
  amount: number
  currency: string
  method: DisbursementMethod
  disbursedBy: Id<"users">
  disbursedAt: number
  receiptUrl?: string
  actualAmount?: number
  variance?: number
  closingNotes?: string
  closedAt?: number
  closedBy?: Id<"users">
}

export interface PettyCashSummary {
  pending: number
  approved: number
  disbursed: number
  closed: number
  rejected: number
  outstandingAmount: number
  totalClosedAmount: number
}

// Zod schemas ---------------------------------------------------------------

export const createRequestSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z.string().default("IDR"),
  category: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional(),
  requesterId: z.string().min(1, "Requester is required"),
  attachments: z.array(z.string().url("Must be a valid URL")).optional(),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>

export const disburseSchema = z.object({
  method: z.enum(DISBURSEMENT_METHODS),
  receiptUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export type DisburseInput = z.infer<typeof disburseSchema>

export const closeSchema = z.object({
  actualAmount: z.coerce.number().nonnegative("Actual amount cannot be negative"),
  closingNotes: z.string().optional(),
})

export type CloseInput = z.infer<typeof closeSchema>

export const rejectSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
})

export type RejectInput = z.infer<typeof rejectSchema>

// Labels --------------------------------------------------------------------

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  disbursed: "Disbursed",
  closed: "Closed",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

export const DISBURSEMENT_METHOD_LABELS: Record<DisbursementMethod, string> = {
  cash: "Cash",
  transfer: "Bank Transfer",
  card: "Card",
}
