"use client"

import * as React from "react"
import { Database, Table, KanbanSquare, Calendar, ListChecks, GanttChart } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { DatabaseShell } from "../components/DatabaseShell"
import { EmptyState } from "../components/EmptyState"

const VIEW_TYPES: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "table",    label: "Table",    icon: Table },
  { id: "kanban",   label: "Kanban",   icon: KanbanSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "list",     label: "List",     icon: ListChecks },
  { id: "gantt",    label: "Gantt",    icon: GanttChart },
]

const MOCK_TABLES = [
  { id: "t_1", name: "Customers",  rowCount: 142 },
  { id: "t_2", name: "Orders",     rowCount: 891 },
  { id: "t_3", name: "Products",   rowCount: 64 },
  { id: "t_4", name: "Suppliers",  rowCount: 18 },
]

function DatabasePreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Database</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_TABLES.length} tables · 5 view types
        </p>
      </div>
    )
  }

  const header = (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Customers</span>
        <span className="text-xs text-muted-foreground">· 142 rows</span>
      </div>
      <div className="flex items-center gap-1">
        {VIEW_TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent"
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    </div>
  )

  const sidebar = (
    <div className="flex flex-col gap-1 p-2">
      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Tables
      </div>
      {MOCK_TABLES.map((t) => (
        <button
          key={t.id}
          type="button"
          className="flex items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
        >
          <span>{t.name}</span>
          <span className="text-muted-foreground">{t.rowCount}</span>
        </button>
      ))}
    </div>
  )

  return (
    <DatabaseShell
      header={header}
      sidebar={sidebar}
    >
      <EmptyState
        title="Pick a view to start"
        description="Switch between table, kanban, calendar, list, or gantt — same data, different lens."
      />
    </DatabaseShell>
  )
}

export default defineFeaturePreview({
  featureId: "database",
  name: "Database",
  description: "Notion-style multi-view database (table, kanban, calendar, list, gantt).",
  component: DatabasePreview,
  category: "productivity",
  tags: ["database", "tables", "views"],
  mockDataSets: [
    {
      id: "default",
      name: "Customers DB",
      description: "4 mock tables with view-switcher and empty-state.",
      data: { tables: MOCK_TABLES, viewTypes: VIEW_TYPES.map((v) => v.id) },
    },
  ],
})
