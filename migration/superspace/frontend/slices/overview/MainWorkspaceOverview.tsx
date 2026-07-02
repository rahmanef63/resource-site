"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id, Doc } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import {
  Activity,
  Building2,
  Users,
  FileText,
  Bell,
  ChevronRight,
  Home,
  Briefcase,
  Clock,
  BarChart3,
  Sparkles,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { getWorkspaceTypeIcon } from "@/frontend/shared/foundation/utils/core/icons" // Fixed import path
import { PendingInvitationsSection } from "./components"

interface MainWorkspaceOverviewProps {
  workspaceId: Id<"workspaces">
}


/**
 * Main Workspace Overview Component
 * 
 * Shows aggregated data from all child workspaces including:
 * - Quick stats (total workspaces, members, notifications)
 * - Child workspace cards with activity summaries
 * - Aggregated reports and trends
 * - Quick switch to child workspaces
 */
export function MainWorkspaceOverview({ workspaceId }: MainWorkspaceOverviewProps) {
  const { setWorkspaceId, mainWorkspace, isMainWorkspace } = useWorkspaceContext()

  // Fetch quick stats
  const quickStats = useQuery(
    api.workspace.overview.getMainWorkspaceQuickStats,
    { mainWorkspaceId: workspaceId }
  )

  // Fetch child workspace summaries
  const childSummaries = useQuery(
    api.workspace.overview.getChildWorkspaceSummaries,
    { mainWorkspaceId: workspaceId, limit: 6 }
  )

  // Fetch aggregated reports
  const aggregatedReports = useQuery(
    api.workspace.overview.getAggregatedReports,
    { mainWorkspaceId: workspaceId }
  )

  // Loading state
  if (quickStats === undefined || childSummaries === undefined) {
    return <MainWorkspaceOverviewSkeleton />
  }

  // If this is not actually a main workspace, show a message
  if (!isMainWorkspace) {
    return (
      <Alert>
        <AlertDescription>
          This view is only available for your Main Workspace.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {mainWorkspace?.name || "Main Workspace"}
          </h1>
          <p className="text-muted-foreground">
            Your personal command center for all workspaces
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Home className="h-3 w-3" />
          Main Workspace
        </Badge>
      </div>

      {/* Pending Invitations */}
      <PendingInvitationsSection />

      {/* Quick Stats */}
      {quickStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workspaces</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quickStats.totalChildWorkspaces}</div>
              <p className="text-xs text-muted-foreground">
                {quickStats.ownedWorkspaces} owned, {quickStats.linkedWorkspaces} linked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {aggregatedReports?.totalMembers ?? "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all workspaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {aggregatedReports?.totalDocuments ?? "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all workspaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quickStats.unreadNotifications}</div>
              <p className="text-xs text-muted-foreground">
                Unread across workspaces
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Child Workspace Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Workspaces</h2>
          {childSummaries && childSummaries.length > 6 && (
            <Button variant="ghost" size="sm">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {childSummaries && childSummaries.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {childSummaries.map((summary) => (
              <WorkspaceCard
                key={summary.workspace._id}
                summary={summary}
                onSelect={() => setWorkspaceId(summary.workspace._id)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h4 className="font-medium mb-1">No child workspaces yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create or link workspaces to see them here.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Link2 className="h-4 w-4 mr-2" />
                  Link existing
                </Button>
                <Button size="sm">
                  Create new
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity Breakdown */}
      {aggregatedReports && aggregatedReports.workspaceBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activity Breakdown
            </CardTitle>
            <CardDescription>
              Activity distribution across your workspaces (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aggregatedReports.workspaceBreakdown.slice(0, 5).map((ws) => {
                const percentage = aggregatedReports.totalActivity > 0
                  ? (ws.activityCount / aggregatedReports.totalActivity) * 100
                  : 0
                return (
                  <div key={String(ws.workspaceId)} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ws.color ?? "#6366f1" }}
                        />
                        <span className="font-medium">{ws.workspaceName}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {ws.activityCount} activities
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Across All */}
      {childSummaries && childSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your workspaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {childSummaries
                  .flatMap((s) =>
                    s.recentActivity.map((a) => ({
                      ...a,
                      workspaceName: s.workspace.name,
                      workspaceColor: (s.workspace as any).color,
                    }))
                  )
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 10)
                  .map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2"
                        style={{ backgroundColor: activity.workspaceColor ?? "#6366f1" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.actorName ?? "Someone"}</span>
                          {" "}
                          <span className="text-muted-foreground">{activity.description}</span>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{activity.workspaceName}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                {childSummaries.every((s) => s.recentActivity.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity across workspaces
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Workspace summary card component
function WorkspaceCard({
  summary,
  onSelect,
}: {
  summary: {
    workspace: Doc<"workspaces">
    isLinked: boolean
    stats: {
      memberCount: number
      documentCount: number
      recentActivityCount: number
    }
    recentActivity: Array<{
      type: string
      description: string
      timestamp: number
    }>
  }
  onSelect: () => void
}) {
  const Icon = getWorkspaceTypeIcon(summary.workspace.type ?? "personal")
  const color = (summary.workspace as any).color ?? "#6366f1"

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        "group"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: color }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-1.5">
                {summary.workspace.name}
                {summary.isLinked && (
                  <Link2 className="h-3 w-3 text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {summary.workspace.type}
              </CardDescription>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {summary.stats.memberCount}
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {summary.stats.documentCount}
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" />
            {summary.stats.recentActivityCount}
          </div>
        </div>

        {summary.recentActivity.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground line-clamp-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {summary.recentActivity[0].description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Loading skeleton
function MainWorkspaceOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// formatRelativeTime is now imported from @/frontend/shared/foundation/utils/core/format
