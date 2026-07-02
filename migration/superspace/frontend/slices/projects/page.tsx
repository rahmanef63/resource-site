"use client"

import { useState } from "react"
import { toast } from "sonner"
import { FolderKanban, Clock, Users, Plus, LayoutGrid, List } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { useProjects } from "./hooks/useProjects"
import { CreateProjectDialog } from "./components/CreateProjectDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ProjectsPageProps {
  workspaceId: Id<"workspaces"> | null
}

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  on_hold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  archived: "bg-muted text-muted-foreground",
}

const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-blue-500",
  medium: "text-amber-500",
  high: "text-red-500",
}

function formatDate(ts: number | undefined) {
  if (!ts) return null
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function ProjectsPage({ workspaceId }: ProjectsPageProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { isLoading, projects, createProject } = useProjects(workspaceId)

  if (!workspaceId) {
    return (
      <FeatureShell featureId="projects" centered padding>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">Please select a workspace to view projects</p>
        </div>
      </FeatureShell>
    )
  }

  const handleCreate = async (data: {
    name: string
    description?: string
    priority?: "low" | "medium" | "high"
    color?: string
  }) => {
    await createProject({
      workspaceId,
      name: data.name,
      description: data.description,
      priority: data.priority,
    })
  }

  return (
    <FeatureShell featureId="projects" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-36 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No projects yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first project to get started
                </p>
              </div>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(projects as any[]).map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(projects as any[]).map((project) => (
                <ProjectRow key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </FeatureShell>
  )
}

function ProjectCard({ project }: { project: any }) {
  const color = project.metadata?.color ?? "#6366f1"

  return (
    <div className="group relative flex flex-col rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <FolderKanban className="h-5 w-5" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight">{project.name}</h3>
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <Badge variant="outline" className={cn("text-xs", STATUS_COLORS[project.status])}>
          {STATUS_LABELS[project.status] ?? project.status}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {project.memberCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.memberCount}
            </span>
          )}
          {project.endDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(project.endDate)}
            </span>
          )}
        </div>
      </div>

      {project.priority && (
        <div className={cn("absolute right-3 top-3 text-xs font-medium", PRIORITY_COLORS[project.priority])}>
          {project.priority.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

function ProjectRow({ project }: { project: any }) {
  const color = project.metadata?.color ?? "#6366f1"

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3 transition-shadow hover:shadow-sm">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}20` }}
      >
        <FolderKanban className="h-4 w-4" style={{ color }} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{project.name}</p>
        {project.description && (
          <p className="truncate text-xs text-muted-foreground">{project.description}</p>
        )}
      </div>

      <Badge variant="outline" className={cn("shrink-0 text-xs", STATUS_COLORS[project.status])}>
        {STATUS_LABELS[project.status] ?? project.status}
      </Badge>

      {project.memberCount > 0 && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {project.memberCount}
        </span>
      )}

      {project.endDate && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(project.endDate)}
        </span>
      )}
    </div>
  )
}
