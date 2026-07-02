import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { ImportExportData, TransferJob, ImportExportStats } from "../types"

/**
 * Hook for Import/Export feature
 */
export function useImportExport(workspaceId: Id<"workspaces"> | null | undefined): ImportExportData & { startImport: any; startExport: any } {
  // Use "skip" if workspaceId is not available to prevent Convex errors
  const history = useQuery(
    api.features.importExport.queries.getHistory,
    workspaceId ? { workspaceId } : "skip"
  )

  const startImport = useMutation(api.features.importExport.mutations.startImport)
  const startExport = useMutation(api.features.importExport.mutations.startExport)

  // Transform or default the data
  const jobs: TransferJob[] = (history as any[])?.map(job => ({
    id: job._id,
    type: job.type as 'import' | 'export',
    entity: job.entity,
    status: job.status as any,
    progress: job.progress ?? (job.status === 'completed' ? 100 : 0),
    startedAt: job._creationTime ? new Date(job._creationTime).toISOString() : new Date().toISOString(), // Fallback
    completedAt: job.completedAt,
    recordCount: job.recordCount ?? 0,
    fileName: job.fileName ?? "unknown.csv"
  })) ?? [];

  const stats: ImportExportStats = {
    totalExports: jobs.filter(j => j.type === 'export').length,
    totalImports: jobs.filter(j => j.type === 'import').length,
    failedJobs: jobs.filter(j => j.status === 'failed').length,
    activeJobs: jobs.filter(j => j.status === 'processing' || j.status === 'pending').length
  };

  return {
    isLoading: history === undefined && workspaceId !== null && workspaceId !== undefined,
    recentJobs: jobs,
    stats,
    startImport,
    startExport,
  }
}
