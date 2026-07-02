import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

// Status tuple ---------------------------------------------------------------

export const CLOSING_STATUSES = [
  "open",
  "recorded",
  "closed",
  "approved",
  "disputed",
] as const
export type ClosingStatus = (typeof CLOSING_STATUSES)[number]

export const CLOSING_STATUS_LABELS: Record<ClosingStatus, string> = {
  open: "Open",
  recorded: "Recorded",
  closed: "Closed",
  approved: "Approved",
  disputed: "Disputed",
}

// Payment-method tuple -------------------------------------------------------

export const PAYMENT_METHODS = [
  "cash",
  "card",
  "qris",
  "bank-transfer",
  "other",
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  qris: "QRIS",
  "bank-transfer": "Bank Transfer",
  other: "Other",
}

// Data-model types (mirror convex/features/dailyClosing/schema.ts) -----------

export interface DailyClosing extends Omit<BaseEntity, "id"> {
  _id: Id<"dailyClosings">
  workspaceId: Id<"workspaces">
  branchId?: string
  businessDate: string // YYYY-MM-DD
  openedAt: number
  openedBy: Id<"users">
  closedAt?: number
  closedBy?: Id<"users">
  approvedAt?: number
  approvedBy?: Id<"users">
  expectedCash?: number
  actualCash?: number
  difference?: number
  cashSales?: number
  cardSales?: number
  qrisSales?: number
  otherSales?: number
  totalSales?: number
  status: ClosingStatus
  closingNotes?: string
  attachments?: string[]
}

export interface DailyClosingItem {
  _id: Id<"dailyClosingItems">
  workspaceId: Id<"workspaces">
  closingId: Id<"dailyClosings">
  paymentMethod: string
  expectedAmount: number
  actualAmount: number
  variance: number
  notes?: string
}

export interface DailyClosingSummary {
  last30Days: number
  openCount: number
  totalSales: number
  totalVariance: number
}

// Zod schemas ---------------------------------------------------------------

export const openDaySchema = z.object({
  businessDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  branchId: z.string().optional(),
})
export type OpenDayInput = z.infer<typeof openDaySchema>

const optionalNonNeg = z.coerce
  .number()
  .nonnegative("Must be zero or greater")
  .optional()

export const recordSalesSchema = z.object({
  cashSales: optionalNonNeg,
  cardSales: optionalNonNeg,
  qrisSales: optionalNonNeg,
  otherSales: optionalNonNeg,
})
export type RecordSalesInput = z.infer<typeof recordSalesSchema>

export const closeDaySchema = z.object({
  actualCash: z.coerce.number().nonnegative("Cannot be negative"),
  closingNotes: z.string().optional(),
})
export type CloseDayInput = z.infer<typeof closeDaySchema>

export const upsertItemSchema = z.object({
  paymentMethod: z.string().min(1, "Payment method required"),
  expectedAmount: z.coerce.number().nonnegative("Cannot be negative"),
  actualAmount: z.coerce.number().nonnegative("Cannot be negative"),
  notes: z.string().optional(),
})
export type UpsertItemInput = z.infer<typeof upsertItemSchema>
