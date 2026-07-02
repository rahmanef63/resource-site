"use client"

import * as React from "react"
import { CheckSquare, FolderOpen, MessageSquare, Users } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { StatsGrid, type StatCardProps } from "../components/StatsGrid"
import { RecentActivitySection, type ActivityItem } from "../components/RecentActivitySection"

const NOW = Date.now()

const MOCK_STATS: StatCardProps[] = [
  { title: "Documents",  value: 142, description: "+12 this week",  icon: FolderOpen,    iconColorClass: "text-blue-500" },
  { title: "Tasks",      value: 38,  description: "8 due today",    icon: CheckSquare,   iconColorClass: "text-amber-500" },
  { title: "Messages",   value: 27,  description: "5 unread",       icon: MessageSquare, iconColorClass: "text-emerald-500" },
  { title: "Members",    value: 12,  description: "2 invites open", icon: Users,         iconColorClass: "text-purple-500" },
]

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1", type: "document", title: "Q2 OKRs uploaded",
    description: "by Bella Setiawan",
    timestamp: NOW - 1_800_000,
    user: { name: "Bella Setiawan" },
    badge: { label: "New", variant: "default" },
  },
  {
    id: "2", type: "task", title: "Deploy v2.3 to production",
    description: "Marked complete",
    timestamp: NOW - 3_600_000 * 4,
    user: { name: "Cahya Nugroho" },
    badge: { label: "Done", variant: "secondary" },
  },
  {
    id: "3", type: "member", title: "Alif Pratama joined",
    description: "Invited as Manager",
    timestamp: NOW - 86_400_000,
    user: { name: "Alif Pratama" },
  },
  {
    id: "4", type: "message", title: "RFC: Storage v3 schema",
    description: "5 new replies in #engineering",
    timestamp: NOW - 86_400_000 * 2,
  },
  {
    id: "5", type: "settings", title: "Workspace branding updated",
    description: "Logo + primary color changed",
    timestamp: NOW - 86_400_000 * 3,
  },
]

function OverviewPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Overview</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Workspace stats + recent activity at a glance
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-4">
      <StatsGrid stats={MOCK_STATS} columns={4} />
      <RecentActivitySection activities={MOCK_ACTIVITY} maxHeight="320px" />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "overview",
  name: "Overview",
  description: "Workspace dashboard with stats grid and recent activity feed.",
  component: OverviewPreview,
  category: "productivity",
  tags: ["overview", "dashboard", "activity", "stats"],
  mockDataSets: [
    {
      id: "default",
      name: "Active workspace",
      description: "Stats from a 12-member workspace plus 5 recent activity items.",
      data: { stats: MOCK_STATS, activity: MOCK_ACTIVITY },
    },
  ],
})
