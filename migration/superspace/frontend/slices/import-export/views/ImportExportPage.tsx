"use client"

import { ArrowUpDown, Database, Repeat, FileBarChart } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useImportExport } from "../hooks/useImportExport"
import { DataTransferDashboard } from "../components/DataTransferDashboard"
import { BulkMigrationTab } from "./BulkMigrationTab"
import { EtlPanel } from "../etl"
import { FeatureShell, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell"

interface ImportExportPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function ImportExportPage({ workspaceId }: ImportExportPageProps) {
  const data = useImportExport(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use import/export
          </p>
        </div>
      </div>
    )
  }

  const handleImport = async (file: File, entityType: string, format: string) => {
    await data.startImport({ workspaceId, entityType, format, fileName: file.name })
  }
  const handleExport = async (entityType: string, format: string) => {
    await data.startExport({ workspaceId, entityType, format })
  }

  const tabs: ShellTabItem[] = [
    {
      value: "data",
      label: "Data Transfer",
      icon: Database,
      content: <DataTransferDashboard data={data} onImport={handleImport} onExport={handleExport} />,
    },
    { value: "bulk-migration", label: "Bulk Migration", icon: Repeat, content: <BulkMigrationTab /> },
    { value: "etl", label: "ETL Reports", icon: FileBarChart, content: <EtlPanel workspaceId={workspaceId} /> },
  ]

  return (
    <FeatureShell featureId="import-export" padding tabs={tabs} defaultTab="data" />
  )
}
