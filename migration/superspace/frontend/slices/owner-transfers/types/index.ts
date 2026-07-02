import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

export const TRANSFER_TYPES = ["withdraw", "inject", "loan", "repayment"] as const
export type TransferType = (typeof TRANSFER_TYPES)[number]

export const TRANSFER_STATUSES = ["pending", "approved", "rejected", "reconciled"] as const
export type TransferStatus = (typeof TRANSFER_STATUSES)[number]

export interface OwnerTransfer extends Omit<BaseEntity, "id"> {
  _id: Id<"ownerTransfers">
  workspaceId: Id<"workspaces">
  branchId?: string
  type: TransferType
  amount: number
  currency: string
  fromAccount?: string
  toAccount?: string
  ownerUserId: Id<"users">
  approvedBy?: Id<"users">
  approvedAt?: number
  transferDate: string
  category?: string
  notes?: string
  attachments?: string[]
  status: TransferStatus
  reconciledAt?: number
}

export interface OwnerTransferSummary {
  totalWithdraw: number
  totalInject: number
  totalLoan: number
  totalRepayment: number
  netOwnerPosition: number
  count: number
}

export const createTransferSchema = z.object({
  type: z.enum(TRANSFER_TYPES),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z.string().default("IDR"),
  fromAccount: z.string().optional(),
  toAccount: z.string().optional(),
  ownerUserId: z.string().min(1, "Owner is required"),
  transferDate: z.string().min(1, "Transfer date is required"),
  branchId: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateTransferInput = z.infer<typeof createTransferSchema>

export const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  withdraw: "Withdraw",
  inject: "Inject Capital",
  loan: "Loan",
  repayment: "Repayment",
}

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  reconciled: "Reconciled",
}
