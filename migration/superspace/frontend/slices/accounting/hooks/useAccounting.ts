import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { AccountingData } from "../types"

// Initial empty data for real accounting usage until DB is ready
const INITIAL_DATA: AccountingData = {
  stats: {
    totalRevenue: 0,
    netProfit: 0,
    pendingInvoices: 0,
    expenses: 0,
    cashBalance: 0
  },
  recentTransactions: [],
  recentInvoices: []
}

/**
 * Hook for Accounting feature
 * 
 * Pattern: Use Convex query directly, no manual loading state
 * The query returns undefined while loading, data when ready
 * 
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 */
export function useAccounting(workspaceId: Id<"workspaces"> | null | undefined): { isLoading: boolean, data: AccountingData } {
  // Query data from Convex - returns undefined while loading
  // For now, we return fallback data because the backend implementation might lag
  const remoteData = useQuery(
    api.features.accounting.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    // undefined = loading, null = no data, otherwise = data
    isLoading: remoteData === undefined && workspaceId !== null && workspaceId !== undefined,
    data: (remoteData as unknown as AccountingData) || INITIAL_DATA,
    // Error handling is done by Convex automatically
  }
}
