"use client";

import * as React from "react";
import { Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ExportBlock({
  filename,
  source,
  description,
}: {
  filename: string;
  source: string;
  description?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  function copy() {
    navigator.clipboard.writeText(source);
    setCopied(true);
    toast.success(`Copied ${filename}`);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([source], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.split("/").pop() || filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex flex-col">
          <span className="font-mono text-xs">{filename}</span>
          {description && (
            <span className="text-[10px] text-muted-foreground">{description}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 gap-1.5" onClick={copy}>
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            Copy
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={download}>
            <Download className="size-3" />
            Download
          </Button>
        </div>
      </div>
      <pre className="max-h-[420px] overflow-auto bg-zinc-950 p-3 text-[11px] leading-relaxed">
        <code className="font-mono text-foreground/90">{source}</code>
      </pre>
    </div>
  );
}
