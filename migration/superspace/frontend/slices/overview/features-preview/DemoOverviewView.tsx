/**
 * Demo-only version of OverviewView that never makes API calls
 * This component is specifically designed for the mock dashboard
 * to ensure no unnecessary network requests are made
 */

"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react"
import type { OverviewData } from "../types"

interface DemoOverviewViewProps {
  mockData: OverviewData
}

export function DemoOverviewView({ mockData }: DemoOverviewViewProps) {
  const recentActivity = mockData.recentActivity || []

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.members?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {mockData.members?.roles?.admins || 0} admins, {mockData.members?.roles?.members || 0} members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.tasks?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {mockData.tasks?.completed || 0} completed
            </p>
            <Progress
              value={mockData.tasks ? (mockData.tasks.completed / mockData.tasks.total) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.projects?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {mockData.projects?.active || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.documents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all workspaces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                  {activity.timestamp}
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Badge variant="outline" className="justify-center p-2">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Badge>
            <Badge variant="outline" className="justify-center p-2">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Badge>
            <Badge variant="outline" className="justify-center p-2">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Event
            </Badge>
            <Badge variant="outline" className="justify-center p-2">
              <FileText className="h-4 w-4 mr-2" />
              New Document
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}