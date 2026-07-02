/**
 * Export/Import Configuration for Tasks Feature
 */

import { api } from "@/convex/_generated/api"
import { parseImportFile } from "@/frontend/shared/foundation/utils/data/shared"
import type { FeatureExportConfig, ImportResult } from "@/frontend/shared/foundation/utils/data/shared"

type ExportedTaskRow = {
  _id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: number | null
  assigneeId: string | null
  createdBy: string | null
  createdAt: number
  updatedAt: number
  completedAt: number | null
  workspaceId: string
}

// ============================================================================
// Export Properties Configuration
// ============================================================================

const exportProperties = [
  {
    key: "_id",
    label: "Task ID",
    type: "string" as const,
    required: false,
    description: "Convex document ID (ignored on create; used only when updating existing)",
  },
  {
    key: "title",
    label: "Title",
    type: "string" as const,
    required: true,
    description: "Task title",
  },
  {
    key: "description",
    label: "Description",
    type: "string" as const,
    required: false,
    description: "Detailed task description",
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    required: false,
    options: ["todo", "in_progress", "completed"],
    description: "Current task status",
  },
  {
    key: "priority",
    label: "Priority",
    type: "select" as const,
    required: false,
    options: ["low", "medium", "high"],
    description: "Priority level",
  },
  {
    key: "assigneeId",
    label: "Assignee ID",
    type: "string" as const,
    required: false,
    description: "User ID of assignee (optional)",
  },
  {
    key: "dueDate",
    label: "Due Date",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Task due date",
  },
  {
    key: "createdBy",
    label: "Created By",
    type: "string" as const,
    required: false,
    description: "User ID who created the task (read-only)",
  },
  {
    key: "createdAt",
    label: "Created At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Creation timestamp (read-only)",
  },
  {
    key: "updatedAt",
    label: "Updated At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Last update timestamp (read-only)",
  },
  {
    key: "completedAt",
    label: "Completed At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Completion timestamp (read-only)",
  },
  {
    key: "workspaceId",
    label: "Workspace ID",
    type: "string" as const,
    required: false,
    description: "Workspace identifier (filled automatically on import)",
  },
]

function applyFieldMapping(row: any, fieldMapping?: Record<string, string>): any {
  if (!fieldMapping || Object.keys(fieldMapping).length === 0) return row

  const mapped: Record<string, any> = { ...row }
  for (const [header, key] of Object.entries(fieldMapping)) {
    if (row?.[header] !== undefined && mapped[key] === undefined) {
      mapped[key] = row[header]
    }
  }
  return mapped
}

function normalizeStatus(value: unknown): "todo" | "in_progress" | "completed" | null {
  if (value === null || value === undefined) return null
  const raw = String(value).trim().toLowerCase()
  if (!raw) return null

  const normalized = raw.replace(/\s+/g, "_").replace(/-/g, "_")
  if (normalized === "inprogress" || normalized === "in_progress") return "in_progress"
  if (normalized === "todo" || normalized === "to_do" || normalized === "pending") return "todo"
  if (normalized === "done" || normalized === "complete" || normalized === "completed") return "completed"
  return null
}

function normalizePriority(value: unknown): "low" | "medium" | "high" | null {
  if (value === null || value === undefined) return null
  const raw = String(value).trim().toLowerCase()
  if (!raw) return null
  if (raw === "urgent") return "high"
  if (raw === "low" || raw === "medium" || raw === "high") return raw as any
  return null
}

function parseOptionalTimestamp(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 0 && value < 1_000_000_000_000) {
      return value * 1000
    }
    return value
  }

  const raw = String(value).trim()
  if (!raw) return null

  const parsed = Date.parse(raw.includes("T") ? raw : `${raw}T00:00:00`)
  return Number.isNaN(parsed) ? null : parsed
}

// ============================================================================
// Export/Import Configuration
// ============================================================================

export const exportConfig: FeatureExportConfig = {
  featureId: "tasks",
  featureName: "Tasks",

  exportProperties: async () => exportProperties,

  exportData: async (request) => {
    if (!request.workspaceId) return []
    if (!request.convex?.query) {
      throw new Error("Convex client not available for export")
    }

    const rawTasks = (await request.convex.query(api.features.tasks.queries.list, {
      workspaceId: request.workspaceId as any,
    })) as any[] | null | undefined

    const transformedTasks: ExportedTaskRow[] = (rawTasks ?? []).map((task) => ({
      _id: String(task._id),
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      assigneeId: task.assigneeId ? String(task.assigneeId) : null,
      createdBy: task.createdBy ? String(task.createdBy) : null,
      createdAt: task.createdAt ?? task._creationTime,
      updatedAt: task.updatedAt ?? task._creationTime,
      completedAt: task.completedAt ?? null,
      workspaceId: String(task.workspaceId),
    }))

    let filteredTasks: ExportedTaskRow[] = transformedTasks

    if (request.dataType === "selected" && request.selectedIds?.length) {
      const selected = new Set(request.selectedIds.map(String))
      filteredTasks = filteredTasks.filter((task) => selected.has(String(task._id)))
    }

    if (request.filters) {
      Object.entries(request.filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          filteredTasks = filteredTasks.filter((task) => (task as any)[field] === value)
        }
      })
    }

    if (request.sortBy) {
      const sortKey = request.sortBy
      const sortOrder = request.sortOrder ?? "asc"
      filteredTasks = [...filteredTasks].sort((a: any, b: any) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        if (aValue === bValue) return 0
        if (sortOrder === "desc") {
          return aValue < bValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    return filteredTasks
  },

  importData: async (request): Promise<ImportResult> => {
    if (!request.workspaceId) {
      throw new Error("workspaceId is required for import")
    }
    if (!request.convex?.mutation) {
      throw new Error("Convex client not available for import")
    }

    const { data } = await parseImportFile(request.file, request.format)

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [] as any[],
      warnings: [] as any[],
    }

    for (let index = 0; index < data.length; index++) {
      const rowNumber = index + 1
      const item = applyFieldMapping(data[index], request.options?.fieldMapping)

      try {
        const title = String(item.title ?? "").trim()
        if (!title) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            message: "Missing required field: title",
            type: "missing" as const,
          })
          continue
        }

        const rawStatus = item.status
        const statusProvided = rawStatus !== undefined && rawStatus !== null && String(rawStatus).trim() !== ""
        const status = normalizeStatus(rawStatus)
        if (statusProvided && !status) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            message: `Invalid status: ${item.status}. Must be one of: todo, in_progress, completed`,
            type: "validation" as const,
          })
          continue
        }

        const rawPriority = item.priority
        const priorityProvided =
          rawPriority !== undefined && rawPriority !== null && String(rawPriority).trim() !== ""
        const priority = normalizePriority(rawPriority)
        if (priorityProvided && !priority) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            message: `Invalid priority: ${item.priority}. Must be one of: low, medium, high`,
            type: "validation" as const,
          })
          continue
        }

        const rawDueDate = item.dueDate
        const dueDateProvided = rawDueDate !== undefined && rawDueDate !== null && String(rawDueDate).trim() !== ""
        const dueDate = parseOptionalTimestamp(rawDueDate)
        if (dueDateProvided && dueDate === null) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            message: `Invalid dueDate: ${item.dueDate}`,
            type: "validation" as const,
          })
          continue
        }

        const descriptionRaw =
          item.description === null || item.description === undefined ? "" : String(item.description)
        const description = descriptionRaw.trim()
        const descriptionProvided = description.length > 0

        const assigneeIdRaw =
          item.assigneeId === null || item.assigneeId === undefined ? "" : String(item.assigneeId).trim()
        const assigneeId = assigneeIdRaw ? assigneeIdRaw : null
        const assigneeIdProvided = assigneeIdRaw.length > 0

        const wantsUpdate = Boolean(request.options?.updateExisting)
        const wantsCreate = Boolean(request.options?.createMissing ?? true)
        const taskId = item._id ? String(item._id).trim() : ""

        if (taskId && wantsUpdate) {
          const patch: any = { title }
          if (statusProvided && status) patch.status = status
          if (priorityProvided && priority) patch.priority = priority
          if (descriptionProvided) patch.description = description
          if (dueDateProvided) patch.dueDate = dueDate
          if (assigneeIdProvided && assigneeId) patch.assigneeId = assigneeId as any

          await request.convex.mutation(api.features.tasks.mutations.update, {
            id: taskId as any,
            patch,
          })
          results.updated++
          continue
        }

        if (!wantsCreate) {
          results.warnings.push({
            row: rowNumber,
            message: "Skipped (createMissing is disabled)",
            type: "format" as const,
          })
          continue
        }

        const createArgs: any = {
          workspaceId: request.workspaceId as any,
          title,
        }
        if (statusProvided && status) createArgs.status = status
        if (priorityProvided && priority) createArgs.priority = priority
        if (descriptionProvided) createArgs.description = description
        if (dueDateProvided && dueDate !== null) createArgs.dueDate = dueDate
        if (assigneeIdProvided && assigneeId) createArgs.assigneeId = assigneeId as any

        await request.convex.mutation(api.features.tasks.mutations.create, createArgs)
        results.imported++
      } catch (error) {
        results.failed++
        results.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : "Unknown error",
          type: "validation" as const,
        })
      }
    }

    return {
      success: results.failed === 0,
      ...results,
    }
  },

  templates: {
    json: {
      name: "Tasks JSON Template",
      description: "Template for importing tasks in JSON format",
      sampleData: [
        {
          title: "Complete project documentation",
          description: "Write comprehensive documentation for the project",
          status: "todo",
          priority: "medium",
          dueDate: "2024-12-31",
        },
        {
          title: "Review pull requests",
          description: "Review and approve pending pull requests",
          status: "in_progress",
          priority: "high",
          dueDate: "2024-12-20",
        },
      ],
    },
    csv: {
      name: "Tasks CSV Template",
      description: "Template for importing tasks in CSV format",
      sampleData: [
        {
          title: "Setup development environment",
          description: "Install and configure development tools",
          status: "todo",
          priority: "high",
          dueDate: "2024-12-25",
        },
      ],
    },
  },
}

export default exportConfig
