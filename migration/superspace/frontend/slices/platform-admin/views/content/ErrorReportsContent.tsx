"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bug, ImageIcon, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  useErrorReports,
} from "../../hooks/usePlatformAdmin"
import type {
  ErrorReport,
  ErrorReportSeverity,
  ErrorReportStatus,
} from "../../types"

interface ErrorReportsContentProps {
  onItemSelect: (report: ErrorReport) => void
  selectedItemId?: string
}

const STATUS_FILTERS: { value: ErrorReportStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "triaged", label: "Triaged" },
  { value: "resolved", label: "Resolved" },
  { value: "wontfix", label: "Won't fix" },
]

const SEVERITY_FILTERS: { value: ErrorReportSeverity | "all"; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const SEVERITY_BADGE: Record<ErrorReportSeverity, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
}

const STATUS_BADGE: Record<ErrorReportStatus, string> = {
  open: "bg-red-500/10 text-red-500 border-red-500/20",
  triaged: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  wontfix: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export function ErrorReportsContent({
  onItemSelect,
  selectedItemId,
}: ErrorReportsContentProps) {
  const [statusFilter, setStatusFilter] = useState<ErrorReportStatus | "all">("all")
  const [severityFilter, setSeverityFilter] = useState<ErrorReportSeverity | "all">("all")

  const { reports, isLoading, isEmpty } = useErrorReports({
    status: statusFilter === "all" ? undefined : statusFilter,
    severity: severityFilter === "all" ? undefined : severityFilter,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b">
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={statusFilter === f.value ? "default" : "outline"}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto">
          <Select
            value={severityFilter}
            onValueChange={(v) => setSeverityFilter(v as ErrorReportSeverity | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_FILTERS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full p-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading reports…
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bug className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No error reports</h3>
            <p className="text-xs text-muted-foreground mt-1">
              When a user clicks &ldquo;Report this error&rdquo; on an in-app error,
              it&apos;ll show up here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const isSelected = report._id === selectedItemId
                return (
                  <TableRow
                    key={report._id}
                    onClick={() => onItemSelect(report)}
                    className={cn(
                      "cursor-pointer",
                      isSelected && "bg-primary/5",
                    )}
                  >
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDistanceToNow(report.createdAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={SEVERITY_BADGE[report.severity]}>
                        {report.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_BADGE[report.status]}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">{report.title}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {report.route ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {report.reporterEmail ?? "—"}
                    </TableCell>
                    <TableCell>
                      {report.screenshotFileId && (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
