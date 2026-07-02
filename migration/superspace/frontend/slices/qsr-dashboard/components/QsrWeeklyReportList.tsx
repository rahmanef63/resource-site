"use client"

import { useQuery } from "convex/react"
import { anyApi } from "convex/server"
import { ExternalLink, FileSpreadsheet, Paperclip } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny: any = anyApi

export interface QsrWeeklyReportListProps {
  workspaceId: Id<"workspaces">
  /** Max rows to show (descending periodStart). Default 10. */
  limit?: number
  /** Show child-count summary column. Default true. */
  showCounts?: boolean
  /** Click handler for row — pass to plug drilldown navigation. */
  onSelect?: (reportId: string) => void
}

type WeeklyReport = {
  _id: string
  fileName: string
  periodStart: string
  periodEnd: string
  status: string
  salesCount?: number
  vendorCount?: number
  cashFlowCount?: number
  inventoryCount?: number
  attachmentUrl?: string
  attachmentLabel?: string
}

/**
 * Table of weekly reports with attachment link (Google Sheet / Drive URL).
 * Owner clicks the link to validate ingested data against the source workbook.
 */
export default function QsrWeeklyReportList({
  workspaceId,
  limit = 10,
  showCounts = true,
  onSelect,
}: QsrWeeklyReportListProps) {
  const reports = useQuery(apiAny.features.qsr.queries.listWeeklyReports, {
    workspaceId,
  }) as WeeklyReport[] | undefined

  if (!reports) {
    return <div className="h-48 animate-pulse rounded-lg border bg-card" />
  }
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        No weekly reports yet. Upload via Import &amp; Export → ETL panel.
      </div>
    )
  }

  const rows = [...reports]
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart))
    .slice(0, limit)

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-4 py-3 text-sm font-medium">Recent Weekly Reports</div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-2 text-left">Period</th>
            <th className="px-4 py-2 text-left">File</th>
            {showCounts && <th className="px-4 py-2 text-right">Sales</th>}
            {showCounts && <th className="px-4 py-2 text-right">Vendor</th>}
            {showCounts && <th className="px-4 py-2 text-right">CF days</th>}
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Attachment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r._id}
              className={onSelect ? "cursor-pointer hover:bg-muted/40" : ""}
              onClick={() => onSelect?.(r._id)}
            >
              <td className="px-4 py-2 whitespace-nowrap font-mono text-xs">
                {r.periodStart} → {r.periodEnd}
              </td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                  {r.fileName}
                </span>
              </td>
              {showCounts && <td className="px-4 py-2 text-right tabular-nums">{r.salesCount ?? "—"}</td>}
              {showCounts && <td className="px-4 py-2 text-right tabular-nums">{r.vendorCount ?? "—"}</td>}
              {showCounts && <td className="px-4 py-2 text-right tabular-nums">{r.cashFlowCount ?? "—"}</td>}
              <td className="px-4 py-2">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-2">
                {r.attachmentUrl ? (
                  <a
                    href={r.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Paperclip className="h-3 w-3" />
                    {r.attachmentLabel ?? "Open"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    processed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    error: "bg-red-500/10 text-red-700 dark:text-red-300",
  }
  const cls = map[status] ?? "bg-muted text-muted-foreground"
  return <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${cls}`}>{status}</span>
}
