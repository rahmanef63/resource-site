import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Analytics feature
 * 
 * Provides workspace analytics and insights
 */
export function useAnalytics(
  workspaceId: Id<"workspaces"> | null | undefined,
  timeRange: "today" | "7d" | "30d" | "90d" = "30d"
) {
  // Query overview stats
  const overview = useQuery(
    api.features.analytics.queries.getOverview,
    workspaceId ? { workspaceId, timeRange } : "skip"
  )

  // Query activity timeline
  const timeline = useQuery(
    api.features.analytics.queries.getActivityTimeline,
    workspaceId ? { workspaceId, timeRange: timeRange === "today" ? "7d" : timeRange } : "skip"
  )

  // Query member stats
  const memberStats = useQuery(
    api.features.analytics.queries.getMemberStats,
    workspaceId ? { workspaceId, timeRange: timeRange === "today" ? "7d" : timeRange } : "skip"
  )

  // Query recent tracked events
  const recentEvents = useQuery(
    api.features.analytics.queries.getRecentEvents,
    workspaceId ? { workspaceId, timeRange } : "skip"
  )

  // Query saved widgets
  const widgets = useQuery(
    api.features.analytics.queries.getWidgets,
    workspaceId ? { workspaceId } : "skip"
  )

  // Query saved reports
  const reports = useQuery(
    api.features.analytics.queries.getReports,
    workspaceId ? { workspaceId } : "skip"
  )

  // Mutations
  const trackEvent = useMutation(api.features.analytics.mutations.trackEvent)
  const createWidget = useMutation(api.features.analytics.mutations.createWidget)
  const updateWidget = useMutation(api.features.analytics.mutations.updateWidget)
  const deleteWidget = useMutation(api.features.analytics.mutations.deleteWidget)
  const createReport = useMutation(api.features.analytics.mutations.createReport)
  const deleteReport = useMutation(api.features.analytics.mutations.deleteReport)

  const isLoading = 
    overview === undefined && 
    workspaceId !== null && 
    workspaceId !== undefined

  return {
    // State
    isLoading,
    overview,
    timeline,
    memberStats,
    recentEvents: recentEvents ?? [],
    widgets: widgets ?? [],
    reports: reports ?? [],
    
    // Actions
    trackEvent,
    createWidget,
    updateWidget,
    deleteWidget,
    createReport,
    deleteReport,
  }
}
