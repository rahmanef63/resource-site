"use client"

import * as React from "react"
import { FileBarChart, Plus, Download } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ReportTemplateGrid, REPORT_TEMPLATES } from "../components/ReportTemplateGrid"

function ReportsPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Reports</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {REPORT_TEMPLATES.length} report templates · Custom + scheduled
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-semibold">Reports</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New report</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="flex w-full justify-evenly">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="saved">Saved (0)</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <ReportTemplateGrid onSelect={() => { /* preview: no-op */ }} />
          </TabsContent>

          <TabsContent value="saved">
            <p className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">
              No saved reports yet. Pick a template above to create one.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "reports",
  name: "Reports",
  description: "Build, save, and schedule reports across workspace data — 6 starter templates.",
  component: ReportsPreview,
  category: "analytics",
  tags: ["reports", "analytics", "exports", "scheduled"],
  mockDataSets: [
    {
      id: "default",
      name: "Report templates",
      description: "6 mock report templates rendered through real ReportTemplateGrid.",
      data: { templates: REPORT_TEMPLATES.map((t) => ({ id: t.id, name: t.name, category: t.category })) },
    },
  ],
})
