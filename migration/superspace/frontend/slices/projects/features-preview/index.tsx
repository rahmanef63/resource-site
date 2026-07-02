"use client"

import * as React from "react"
import { FolderKanban, Plus, Users, Calendar } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { CreateProjectDialog } from "../components/CreateProjectDialog"

const MOCK_PROJECTS = [
  { id: "p_1", name: "Q2 Launch — Mobile",   color: "#6366f1", status: "active",   members: 8, dueIn: "in 12 days",  priority: "high"   },
  { id: "p_2", name: "Website Redesign",     color: "#8b5cf6", status: "active",   members: 5, dueIn: "in 28 days",  priority: "medium" },
  { id: "p_3", name: "Customer Onboarding",  color: "#22c55e", status: "planning", members: 3, dueIn: "in 6 weeks",  priority: "medium" },
  { id: "p_4", name: "Tech Debt — Auth",     color: "#f97316", status: "active",   members: 2, dueIn: "no due date", priority: "low"    },
]

const PRIORITY_VARIANT: Record<string, "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
}

function ProjectsPreview({ compact }: FeaturePreviewProps) {
  const [showCreate, setShowCreate] = React.useState(false)

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Projects</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_PROJECTS.length} projects · {MOCK_PROJECTS.filter((p) => p.status === "active").length} active
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
        <h3 className="text-base font-semibold">Projects</h3>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> New project
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-auto p-4 sm:grid-cols-2">
        {MOCK_PROJECTS.map((p) => (
          <div key={p.id} className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="grid h-8 w-8 place-items-center rounded-md text-white"
                  style={{ backgroundColor: p.color }}
                >
                  <FolderKanban className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <Badge variant={PRIORITY_VARIANT[p.priority] ?? "default"}>{p.priority}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.members}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.dueIn}</span>
              <span className="ml-auto rounded bg-muted px-1.5 py-0.5">{p.status}</span>
            </div>
          </div>
        ))}
      </div>

      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={async () => { /* preview: no-op */ }}
      />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "projects",
  name: "Projects",
  description: "Project tracking with members, priorities, status, and due dates.",
  component: ProjectsPreview,
  category: "productivity",
  tags: ["projects", "tasks", "kanban"],
  mockDataSets: [
    {
      id: "default",
      name: "Active project board",
      description: "4 mixed-priority projects with create-dialog wired.",
      data: { projects: MOCK_PROJECTS },
    },
  ],
})
