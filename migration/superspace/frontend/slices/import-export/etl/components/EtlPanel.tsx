"use client";

import { AlertTriangle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Id } from "@convex/_generated/dataModel";

import { useEtlImport } from "../hooks/useEtlImport";
import { UploadDropzone } from "./UploadDropzone";
import { ImportPreview } from "./ImportPreview";
import { EtlReportsList } from "./EtlReportsList";

type Props = {
  workspaceId: Id<"workspaces">;
};

export function EtlPanel({ workspaceId }: Props) {
  const etl = useEtlImport(workspaceId);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Upload Laporan Mingguan</h3>
          <p className="text-xs text-muted-foreground">
            Ekstrak data Excel ke 15 kategori (penjualan, vendor, cash flow, inventory, dll). Workspace-scoped + audit-logged.
          </p>
        </div>

        <UploadDropzone onFileSelect={etl.handleFile} isLoading={etl.phase === "parsing" || etl.phase === "uploading"} />

        {etl.phase === "ready" && etl.parsed && (
          <>
            {etl.warnings.length > 0 && (
              <Alert variant={etl.warnings.some((w) => w.severity === "warning") ? "default" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{etl.warnings.length} catatan validasi</AlertTitle>
                <AlertDescription className="space-y-1 text-xs">
                  {etl.warnings.slice(0, 3).map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-medium">{w.category}:</span>
                      <span className="text-muted-foreground">{w.message}</span>
                    </div>
                  ))}
                  {etl.warnings.length > 3 && (
                    <p className="text-muted-foreground">+ {etl.warnings.length - 3} catatan lain</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <ImportPreview data={etl.parsed} />

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={etl.reset}>Batal</Button>
              <Button onClick={etl.startImport}>Import ke workspace</Button>
            </div>
          </>
        )}

        {etl.phase === "uploading" && (
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{etl.progress.label}</span>
              <span className="tabular-nums">{etl.progress.current} / {etl.progress.total}</span>
            </div>
            <Progress value={(etl.progress.current / Math.max(1, etl.progress.total)) * 100} />
          </div>
        )}

        {etl.phase === "done" && etl.result && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Import sukses</AlertTitle>
            <AlertDescription className="space-y-1 text-xs">
              {Object.entries(etl.result).map(([k, v]) => (
                <div key={k}>
                  {k}: <span className="font-medium tabular-nums">{v}</span> record
                </div>
              ))}
              <Button variant="link" className="h-auto p-0 text-xs" onClick={etl.reset}>Upload lagi</Button>
            </AlertDescription>
          </Alert>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Riwayat Report</h3>
        </div>
        <EtlReportsList workspaceId={workspaceId} />
      </section>
    </div>
  );
}
