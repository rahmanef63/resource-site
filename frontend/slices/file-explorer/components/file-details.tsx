"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FsEntry } from "../adapter";
import { iconFor, colorFor } from "../lib/icons";
import { fmtSize, joinPath } from "../lib/format";
import { cn } from "@/lib/utils";

// Info strip: icon, name, size, kind, full path + a copy-path button. With a
// selection it shows that entry; otherwise the current folder, so the address
// is always copyable. Copy feedback is inline (the slice has no toast sink).
export function FileDetails({
  entry,
  dir,
}: {
  entry: FsEntry | null;
  dir: string;
}) {
  const [copied, setCopied] = useState<"ok" | "err" | null>(null);
  const full = entry ? joinPath(dir, entry.name) : dir;
  const Icon = entry ? iconFor(entry) : null;
  const kind = !entry
    ? "Folder"
    : entry.kind === "dir"
      ? "Folder"
      : (entry.ext ?? "").toUpperCase() || "File";

  const copy = () => {
    navigator.clipboard
      .writeText(full)
      .then(() => setCopied("ok"))
      .catch(() => setCopied("err"));
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-3 py-2">
      {Icon && entry && (
        <Icon className={cn("size-6 shrink-0", colorFor(entry))} />
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-medium">
          {entry?.name ?? "Current folder"}
        </span>
        <span
          className="truncate font-mono text-[10px] text-muted-foreground"
          title={full}
        >
          {full}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>{kind}</span>
        {entry?.kind === "file" && (
          <span className="tabular-nums">{fmtSize(entry.size)}</span>
        )}
        {copied && (
          <span className={cn(copied === "ok" ? "text-foreground" : "text-destructive")}>
            {copied === "ok" ? "Copied" : "Copy failed"}
          </span>
        )}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-6 shrink-0"
          title="Copy path"
          aria-label="Copy path"
          onClick={copy}
        >
          {copied === "ok" ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
