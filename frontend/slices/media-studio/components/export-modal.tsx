"use client";

import { useRef } from "react";
import { HardDriveDownload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilePicker, type FilePickerHandle } from "@/shared/ui/FilePicker";
import { Segmented } from "./segmented";

export type ExportTab = "json" | "html";

// Tabbed JSON/HTML preview with copy, download, import, and an optional
// "Save to host" action that appears once the host seam wires a doc-saver.
export function ExportModal({
  open,
  tab,
  text,
  hostWired,
  onOpenChange,
  onTab,
  onDownload,
  onCopy,
  onImport,
  onHostSave,
}: {
  open: boolean;
  tab: ExportTab;
  text: string;
  hostWired: boolean;
  onOpenChange: (open: boolean) => void;
  onTab: (t: ExportTab) => void;
  onDownload: () => void;
  onCopy: () => void;
  onImport: (file: File) => void;
  onHostSave: () => void;
}) {
  const fileRef = useRef<FilePickerHandle>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80dvh] flex-col gap-3 sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-6">
            <DialogTitle>Export / Import</DialogTitle>
            <Segmented<ExportTab>
              options={[
                { value: "json", label: "JSON" },
                { value: "html", label: "HTML" },
              ]}
              value={tab}
              onChange={onTab}
              className="ml-1"
            />
            <Button
              variant="secondary"
              size="sm"
              className="ml-auto"
              onClick={() => fileRef.current?.open()}
            >
              Import file…
            </Button>
          </div>
        </DialogHeader>

        <pre className="m-0 min-h-0 flex-1 overflow-auto rounded-md bg-muted px-4 py-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words text-foreground">
          {text}
        </pre>

        <div className="flex items-center gap-2">
          <span className="flex-1 text-[11px] text-muted-foreground">
            Auto z-index from layer order · per-layer CSS included.
          </span>
          {hostWired && (
            <Button variant="secondary" size="sm" onClick={onHostSave}>
              <HardDriveDownload className="size-3.5" />
              Save to host
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onCopy}>
            Copy
          </Button>
          <Button size="sm" onClick={onDownload}>
            Download .{tab}
          </Button>
        </div>

        <FilePicker
          ref={fileRef}
          accept=".json,.html,.htm,.svg,.txt"
          onFiles={(files) => {
            const f = files[0];
            if (f) onImport(f);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
