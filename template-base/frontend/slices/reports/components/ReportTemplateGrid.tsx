"use client"

import * as React from "react"
import {
  Activity,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  PieChart,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  dataSources: string[]
  metrics: string[]
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: "workspace-overview", name: "Workspace Overview", description: "Summary of workspace activity, members, and key metrics", icon: Activity,    category: "general",      dataSources: ["members", "tasks", "projects"],   metrics: ["count", "completion_rate"]              },
  { id: "member-activity",    name: "Member Activity",    description: "Detailed breakdown of member contributions and activity", icon: Users,       category: "team",         dataSources: ["members", "auditLogs"],           metrics: ["activity_count", "engagement"]          },
  { id: "task-completion",    name: "Task Completion",    description: "Track task progress and completion rates over time",      icon: TrendingUp,  category: "productivity", dataSources: ["tasks"],                          metrics: ["total", "completed", "pending"]         },
  { id: "time-tracking",      name: "Time Tracking",      description: "Hours logged per project and member",                     icon: Clock,       category: "productivity", dataSources: ["timeEntries", "projects"],        metrics: ["hours", "average"]                      },
  { id: "sales-performance",  name: "Sales Performance",  description: "Revenue, deals, and sales pipeline analysis",             icon: BarChart3,   category: "sales",        dataSources: ["deals", "accounts"],              metrics: ["revenue", "deals_won", "pipeline_value"] },
  { id: "customer-insights",  name: "Customer Insights",  description: "Customer behavior and engagement metrics",                icon: PieChart,    category: "crm",          dataSources: ["contacts", "activities"],         metrics: ["engagement", "retention"]               },
]

export interface ReportTemplateGridProps {
  templates?: ReportTemplate[]
  onSelect?: (templateId: string) => void
}

export function ReportTemplateGrid({
  templates = REPORT_TEMPLATES,
  onSelect,
}: ReportTemplateGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const Icon = template.icon
        return (
          <Card
            key={template.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => onSelect?.(template.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="mt-1 text-xs">{template.category}</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {template.metrics.slice(0, 3).map((m) => (
                  <Badge key={m} variant="outline" className="text-[10px]">{m.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
