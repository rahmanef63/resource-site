import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { PosData } from "../types"

// Initial empty data for real POS usage
const INITIAL_DATA: PosData = {
  stats: {
    totalSales: 0,
    transactionCount: 0,
    topProduct: '-',
    averageOrderValue: 0,
    returns: 0
  },
  popularProducts: [],
  recentTransactions: []
}

/**
 * Hook for POS feature
 */
export function usePos(workspaceId: Id<"workspaces"> | null | undefined): { isLoading: boolean, data: PosData } {
  const remoteData = useQuery(
    api.features.pos.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    isLoading: remoteData === undefined && workspaceId !== null && workspaceId !== undefined,
    data: (remoteData as unknown as PosData) || INITIAL_DATA,
  }
}
