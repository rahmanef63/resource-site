import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { MarketingData } from "../types"

// Initial empty data for real Marketing usage
const INITIAL_DATA: MarketingData = {
  stats: {
    activeCampaigns: 0,
    totalLeads: 0,
    conversionRate: 0,
    spend: 0,
    roi: 0
  },
  activeCampaigns: [],
  recentActivity: []
}

/**
 * Hook for Marketing feature
 */
export function useMarketing(workspaceId: Id<"workspaces"> | null | undefined): { isLoading: boolean, data: MarketingData } {
  const remoteData = useQuery(
    api.features.marketing.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    isLoading: remoteData === undefined && workspaceId !== null && workspaceId !== undefined,
    data: (remoteData as unknown as MarketingData) || INITIAL_DATA,
  }
}
