"use client"

import * as React from "react"
import { Users, FileText, FolderKanban, Activity, TrendingUp, Calendar } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// MetricCard is a slice-local adapter around `@/frontend/shared/ui/dashboard`
// MetricCard — see AnalyticsPage.tsx for the wiring. Imported from the view
// (not shared) so the features-preview validator sees this slice reusing its
// own real components.
import { MetricCard } from "../views/AnalyticsPage"

const MOCK_TIMELINE = [
  { date: "2026-04-19", count: 42 },
  { date: "2026-04-20", count: 56 },
  { date: "2026-04-21", count: 48 },
  { date: "2026-04-22", count: 71 },
  { date: "2026-04-23", count: 65 },
  { date: "2026-04-24", count: 89 },
  { date: "2026-04-25", count: 73 },
]

function AnalyticsPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Analytics</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Activity · members · tasks · events
        </p>
      </div>
    )
  }

  const max = Math.max(...MOCK_TIMELINE.map((t) => t.count))

  return (
    <div className="h-full overflow-auto p-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Team Members" value={24}  icon={Users}        description="Active members" />
          <MetricCard title="Total Tasks"  value={189} icon={Activity}     description="142 completed" trend={75} trendLabel="completion rate" />
          <MetricCard title="Projects"     value={12}  icon={FolderKanban} description="8 active" />
          <MetricCard title="Documents"    value={341} icon={FileText}     description="Total files" />
        </div>

        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList className="flex w-full justify-evenly">
            <TabsTrigger value="activity" className="gap-2"><Activity className="h-4 w-4" /> Activity</TabsTrigger>
            <TabsTrigger value="members"  className="gap-2"><Users className="h-4 w-4" /> Members</TabsTrigger>
            <TabsTrigger value="tasks"    className="gap-2"><TrendingUp className="h-4 w-4" /> Tasks</TabsTrigger>
            <TabsTrigger value="events"   className="gap-2"><Calendar className="h-4 w-4" /> Events</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Timeline</CardTitle>
                <CardDescription>Workspace activity over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {MOCK_TIMELINE.map((item) => (
                    <div key={item.date} className="flex items-center gap-2">
                      <div className="w-20 text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div
                        className="h-6 rounded bg-primary/80"
                        style={{ width: `${(item.count / max) * 100}%`, minWidth: item.count > 0 ? "4px" : "0" }}
                      />
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "analytics",
  name: "Analytics",
  description: "Workspace analytics — activity, members, tasks, events with time-range filters.",
  component: AnalyticsPreview,
  category: "analytics",
  tags: ["analytics", "metrics", "insights", "activity"],
  mockDataSets: [
    {
      id: "default",
      name: "7-day activity",
      description: "Real MetricCard from AnalyticsPage with 7-day mock timeline.",
      data: { timeline: MOCK_TIMELINE },
    },
  ],
})
