"use client"

import React, { useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import {
  FileBarChart,
  Plus,
  Download,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { REPORT_TEMPLATES } from "../components/ReportTemplateGrid"

interface ReportsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const TIME_RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
]

interface ReportFormData {
  name: string
  description: string
  template: string
  type: "summary" | "detailed" | "comparison" | "trend"
  timeRange: string
}

const defaultFormData: ReportFormData = {
  name: "",
  description: "",
  template: "",
  type: "summary",
  timeRange: "30d",
}

export default function ReportsPage({ workspaceId }: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "90d">("30d")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [formData, setFormData] = useState<ReportFormData>(defaultFormData)
  const [isProcessing, setIsProcessing] = useState(false)

  // Use analytics queries for report data
  const overview = useQuery(
    api.features.analytics.queries.getOverview,
    workspaceId ? { workspaceId, timeRange } : "skip"
  )

  const timeline = useQuery(
    api.features.analytics.queries.getActivityTimeline,
    workspaceId ? { workspaceId, timeRange: timeRange === "today" ? "7d" : timeRange } : "skip"
  )

  const memberStats = useQuery(
    api.features.analytics.queries.getMemberStats,
    workspaceId ? { workspaceId, timeRange: timeRange === "today" ? "7d" : timeRange } : "skip"
  )

  // Get saved reports
  const savedReports = useQuery(
    api.features.analytics.queries.getReports,
    workspaceId ? { workspaceId } : "skip"
  )

  // Mutations
  const createReport = useMutation(api.features.analytics.mutations.createReport)
  const deleteReport = useMutation(api.features.analytics.mutations.deleteReport)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view reports
          </p>
        </div>
      </div>
    )
  }

  const handleCreateReport = async () => {
    if (!workspaceId || !formData.name.trim()) return
    setIsProcessing(true)

    // Find template config if selected
    const templateConfig = REPORT_TEMPLATES.find(t => t.id === formData.template)

    try {
      await createReport({
        workspaceId,
        name: formData.name.trim(),
        description: formData.description || undefined,
        type: formData.type,
        config: {
          dataSources: templateConfig?.dataSources || ["workspace"],
          metrics: templateConfig?.metrics || ["count"],
          timeRange: {
            type: formData.timeRange,
          },
        },
      })
      setCreateDialogOpen(false)
      setFormData(defaultFormData)
    } catch (error) {
      console.error("Failed to create report:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteReport = async (reportId: Id<"analyticsReports">) => {
    if (!workspaceId) return
    try {
      await deleteReport({ workspaceId, reportId })
    } catch (error) {
      console.error("Failed to delete report:", error)
    }
  }

  const handleExport = (format: "pdf" | "csv" | "excel") => {
    // In a real implementation, this would generate and download the report

  }

  return (
    <FeatureShell featureId="reports" padding={false}>
      <div className="flex h-full flex-col space-y-4 p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full space-y-4">
        <div className="flex items-center justify-between gap-2">
          <TabsList className="flex w-full justify-evenly">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Saved Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Placeholder for dashboard content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedReports?.map((report: any) => (
              <Card key={report._id}>
                <CardHeader>
                  <CardTitle>{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{report.type}</Badge>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {(!savedReports || savedReports.length === 0) && (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                No saved reports found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <div className="py-10 text-center text-muted-foreground">
            Scheduled reports coming soon.
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <ResponsiveDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Create New Report</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Configure report settings and data sources.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>
        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">Template</Label>
              <Select
                value={formData.template}
                onValueChange={(v) => setFormData({ ...formData, template: v })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v: any) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="trend">Trend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ResponsiveDialog.Body>
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateReport} disabled={isProcessing}>
            {isProcessing ? "Creating..." : "Create Report"}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>
      </div>
    </FeatureShell>
  )
}
