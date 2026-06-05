"use client";

import * as React from "react";
import { Download, Loader2, Upload, Database } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilePicker, type FilePickerHandle } from "@/components/shared/ui/FilePicker";
import type { BackupSnapshot } from "./types";

/**
 * One-click backup / restore. Download a structured JSON snapshot of all site
 * content (no credentials), or restore from one. Restore replaces existing
 * content, so it double-confirms. Both calls must be admin-gated server-side.
 *
 * Props-driven (R3): the host injects the two backend calls — typically
 * `() => convex.query(api.backup.exportAll, {})` and
 * `(snapshot) => importAllMutation({ snapshot })`.
 */
export function BackupCard({
  exportAll,
  importAll,
  filePrefix = "site-backup",
}: {
  exportAll: () => Promise<BackupSnapshot>;
  importAll: (snapshot: BackupSnapshot) => Promise<{ inserted: number }>;
  filePrefix?: string;
}) {
  const pickerRef = React.useRef<FilePickerHandle>(null);
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);

  async function download() {
    setExporting(true);
    try {
      const snapshot = await exportAll();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date(snapshot.exportedAt).toISOString().slice(0, 10);
      a.href = url;
      a.download = `${filePrefix}-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup terunduh.");
    } catch {
      toast.error("Gagal membuat backup.");
    } finally {
      setExporting(false);
    }
  }

  async function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (!window.confirm("Restore akan MENGGANTI semua konten saat ini dengan isi backup. Lanjut?")) return;
    setImporting(true);
    try {
      const snapshot = JSON.parse(await file.text()) as BackupSnapshot;
      if (!snapshot?.tables) throw new Error("invalid");
      const r = await importAll(snapshot);
      toast.success(`Restore selesai — ${r.inserted} item dipulihkan.`);
    } catch {
      toast.error("File backup tidak valid atau gagal restore.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="flex items-center gap-2 font-medium">
            <Database className="size-4 text-primary" /> Backup & Restore
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Unduh snapshot semua konten (blog, portfolio, halaman, pengaturan). Simpan
            sendiri, atau pulihkan kapan saja. Tidak menyertakan data login.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={download} disabled={exporting} className="gap-1.5">
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Unduh backup
          </Button>
          <Button variant="outline" size="sm" onClick={() => pickerRef.current?.open()} disabled={importing} className="gap-1.5">
            {importing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Restore dari file
          </Button>
          <FilePicker ref={pickerRef} accept="application/json,.json" onFiles={onFiles} />
        </div>
        <p className="text-[11px] text-muted-foreground">
          ⚠️ Restore mengganti konten yang ada. Unduh backup dulu sebelum restore.
        </p>
      </CardContent>
    </Card>
  );
}
