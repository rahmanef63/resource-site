"use client";

import { useQuery, useMutation } from "convex/react";
import { anyApi } from "convex/server";
import { Trash2, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny: any = anyApi;

type Props = {
  workspaceId: Id<"workspaces">;
};

type Report = {
  _id: Id<"etlReports">;
  fileName: string;
  periodStart: string;
  periodEnd: string;
  uploadedAt: number;
  status: "pending" | "processed" | "error";
  validationStatus?: "clean" | "needs_review" | "validated";
  salesCount?: number;
  vendorCount?: number;
  cashFlowCount?: number;
};

export function EtlReportsList({ workspaceId }: Props) {
  const reports = useQuery(apiAny.features.importExport.etl.listReports, { workspaceId, limit: 25 }) as Report[] | undefined;
  const deleteReport = useMutation(apiAny.features.importExport.etl.deleteReport);

  if (reports === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!reports.length) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada report. Upload file pertama di atas.
      </div>
    );
  }

  const handleDelete = async (reportId: Id<"etlReports">, fileName: string) => {
    if (!confirm(`Hapus report "${fileName}"? Semua data terkait ikut terhapus.`)) return;
    try {
      await deleteReport({ workspaceId, reportId });
      toast.success("Report dihapus.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal hapus report.");
    }
  };

  return (
    <div className="space-y-2">
      {reports.map((r) => {
        const ok = r.status === "processed";
        const total = (r.salesCount ?? 0) + (r.vendorCount ?? 0) + (r.cashFlowCount ?? 0);
        return (
          <div
            key={r._id}
            className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 hover:bg-accent/40 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{r.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {r.periodStart} → {r.periodEnd} · {new Date(r.uploadedAt).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {r.validationStatus === "needs_review" && (
                <Badge variant="outline" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> review
                </Badge>
              )}
              {ok ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {total} rec
                </Badge>
              ) : (
                <Badge variant="outline">{r.status}</Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(r._id, r.fileName)}
                aria-label={`Hapus ${r.fileName}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
