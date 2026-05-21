"use client";

/** FilesCell — list of file URL refs with chip display + paste-URL input.
 *  Simplified vs upstream: no upload UX (host can plug `files` slice
 *  adapter at a higher level if needed). Value shape: string[] (each
 *  string = file URL or storage ref). */

import { useState } from "react";
import { File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

interface FilesCellProps {
  value: string[];
  readOnly?: boolean;
  onChange?: (next: string[]) => void;
}

function fileLabel(url: string): string {
  const last = url.split("/").pop() ?? url;
  return decodeURIComponent(last).slice(0, 40);
}

export function FilesCell({ value, readOnly, onChange }: FilesCellProps) {
  const [draft, setDraft] = useState("");
  const files = Array.isArray(value) ? value : [];

  const add = () => {
    const v = draft.trim();
    if (!v || !onChange) return;
    onChange([...files, v]);
    setDraft("");
  };
  const remove = (url: string) => onChange?.(files.filter((f) => f !== url));

  if (readOnly) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <File className="h-3.5 w-3.5 text-muted-foreground" />
        {files.length === 0
          ? <span className="text-muted-foreground/60">—</span>
          : <span>{files.length} file{files.length === 1 ? "" : "s"}</span>}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-1 rounded px-2 py-1 text-left text-xs hover:bg-accent/50",
          )}
        >
          <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {files.length
            ? <span className="min-w-0 truncate">{files.length} file{files.length === 1 ? "" : "s"}</span>
            : <span className="text-muted-foreground">Attach file</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="space-y-2">
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {files.map((url) => (
              <div key={url} className="flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-xs">
                <a href={url} target="_blank" rel="noreferrer" className="flex-1 truncate hover:underline">
                  {fileLabel(url)}
                </a>
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="rounded p-0.5 text-muted-foreground hover:bg-accent"
                  aria-label="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {files.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">No files</div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); add(); }} className="flex gap-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste file URL"
              className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-xs"
            />
            <button
              type="submit"
              className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
            >
              Add
            </button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
