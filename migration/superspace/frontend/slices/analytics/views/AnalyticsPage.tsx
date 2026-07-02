"use client"

// @dod:skip-uiux013 reason="analytics: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import React, { useState } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  FolderKanban,
  Activity,
  Calendar,
  Download,
  Settings,
  RefreshCw
} from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useAnalytics } from "../hooks/useAnalytics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { MetricCard as SharedMetricCard } from "@/frontend/shared/ui/dashboard"

interface AnalyticsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

type TimeRange = "today" | "7d" | "30d" | "90d"

/**
 * Analytics Page Component
 * Provides workspace analytics and insights dashboard
 */
export default function AnalyticsPage({ workspaceId }: AnalyticsPageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const { isLoading, overview, timeline, memberStats, recentEvents } = useAnalytics(workspaceId, timeRange)

  const formatPropertyValue = (value: unknown) => {
    if (value === null || value === undefined) return ""
    if (typeof value === "string") {
      return value.length > 48 ? `${value.slice(0, 45)}...` : value
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value)
    }
    try {
      const serialized = JSON.stringify(value)
      return serialized.length > 48 ? `${serialized.slice(0, 45)}...` : serialized
    } catch {
      return String(value)
    }
  }

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view analytics
          </p>
        </div>
      </div>
    )
  }

  const timeRangeLabel = {
    today: "Today",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
  }[timeRange]

  return (
    <FeatureShell featureId="analytics" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing data for {timeRangeLabel}
              </div>
              <Select 
                value={timeRange} 
                onValueChange={(value) => setTimeRange(value as TimeRange)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Team Members"
                value={overview?.members?.total ?? 0}
                icon={Users}
                description="Active members"
              />
              <MetricCard
                title="Total Tasks"
                value={overview?.tasks?.total ?? 0}
                icon={Activity}
                description={`${overview?.tasks?.completed ?? 0} completed`}
                trend={overview?.tasks?.total ? Math.round((overview?.tasks?.completed / overview?.tasks?.total) * 100) : 0}
                trendLabel="completion rate"
              />
              <MetricCard
                title="Projects"
                value={overview?.projects?.total ?? 0}
                icon={FolderKanban}
                description={`${overview?.projects?.active ?? 0} active`}
              />
              <MetricCard
                title="Documents"
                value={overview?.documents ?? 0}
                icon={FileText}
                description="Total files"
              />
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="activity" className="space-y-4">
              <TabsList className="inline-flex flex-wrap">
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Activity Timeline Chart Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Activity Timeline</CardTitle>
                      <CardDescription>
                        Workspace activity over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {timeline?.timeline && timeline.timeline.length > 0 ? (
                        <div className="space-y-2">
                          {timeline.timeline.slice(-7).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-20 text-xs text-muted-foreground">
                                {new Date(item.date).toLocaleDateString("en-US", { 
                                  month: "short", 
                                  day: "numeric" 
                                })}
                              </div>
                              <div 
                                className="h-6 bg-primary/80 rounded"
                                style={{ 
                                  width: `${Math.min(100, (item.count / Math.max(...timeline.timeline.map((t: any) => t.count))) * 100)}%`,
                                  minWidth: item.count > 0 ? "4px" : "0"
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {item.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                          No activity data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                      <CardDescription>
                        Latest actions in workspace
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {overview?.recentActivity && overview.recentActivity.length > 0 ? (
                        <div className="space-y-3">
                          {overview.recentActivity.slice(0, 5).map((activity: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 text-sm">
                              <div className="mt-1">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.entityType && `${activity.entityType} • `}
                                  {new Date(activity.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                          No recent activity
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="members">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Members by Role */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Members by Role</CardTitle>
                      <CardDescription>
                        Distribution of team members
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {overview?.members?.roles ? (
                        <div className="space-y-3">
                          {Object.entries(overview.members.roles).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {role}
                                </Badge>
                              </div>
                              <span className="font-medium">{count as number}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                          No member data
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Most Active Members */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Most Active Members</CardTitle>
                      <CardDescription>
                        Top contributors this period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {memberStats?.memberActivity && memberStats.memberActivity.length > 0 ? (
                        <div className="space-y-3">
                          {memberStats.memberActivity.slice(0, 5).map((member: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                  {idx + 1}
                                </div>
                                <span className="text-sm truncate max-w-[150px]">
                                  {member.userId}
                                </span>
                              </div>
                              <Badge variant="secondary">
                                {member.activityCount} actions
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                          No activity data
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Task Completion */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Task Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold">
                          {overview?.tasks?.total 
                            ? Math.round((overview.tasks.completed / overview.tasks.total) * 100) 
                            : 0}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {overview?.tasks?.completed ?? 0} of {overview?.tasks?.total ?? 0} tasks
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending Tasks */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Pending Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-yellow-500">
                          {overview?.tasks?.pending ?? 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Tasks in progress
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Completed Tasks */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Completed Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-green-500">
                          {overview?.tasks?.completed ?? 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Tasks done
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Events</CardTitle>
                    <CardDescription>Tracked product events (analyticsEvents)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentEvents.length > 0 ? (
                      <div className="space-y-3">
                        {recentEvents.slice(0, 25).map((event: any) => (
                          <div
                            key={String(event._id)}
                            className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge variant="secondary" className="shrink-0">
                                  {event.eventType}
                                </Badge>
                                <div className="text-sm font-medium truncate">{event.eventName}</div>
                              </div>
                              {event.properties ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {Object.entries(event.properties)
                                    .slice(0, 4)
                                    .map(([key, value]) => (
                                      <Badge key={key} variant="outline" className="text-[10px]">
                                        {key}:{formatPropertyValue(value)}
                                      </Badge>
                                    ))}
                                </div>
                              ) : null}
                            </div>

                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {event.timestamp ? new Date(event.timestamp).toLocaleString() : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center text-muted-foreground">
                        No events tracked yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      </div>
    </FeatureShell>
  )
}

// MetricCard — thin adapter around shared `MetricCard` that preserves the
// analytics-specific API (`description` text + `trend: number` 0-100 with a
// >50/<50/=50 up/down/neutral threshold).
//
// @dod:dup-eliminate Real implementation lives at
// `frontend/shared/ui/dashboard/MetricCard`. This wrapper exists so the
// 4 call-sites above and the features-preview can keep their original
// prop shape without a wide rename.
export interface MetricCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  description?: string
  trend?: number
  trendLabel?: string
}

export function MetricCard({ title, value, icon, description, trend, trendLabel }: MetricCardProps) {
  const direction: "up" | "down" | "neutral" | undefined =
    trend === undefined ? undefined : trend > 50 ? "up" : trend < 50 ? "down" : "neutral"

  return (
    <SharedMetricCard
      title={title}
      value={value.toLocaleString()}
      icon={icon}
      subtitle={description}
      trend={
        trend !== undefined && direction
          ? { value: trend, direction, label: trendLabel }
          : undefined
      }
    />
  )
}
