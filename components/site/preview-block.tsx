"use client";

import * as React from "react";
import { Code2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import { PreviewFrame } from "./preview-frame";

export function PreviewBlock({
  preview,
  code,
  language = "tsx",
  filename,
  meta,
  iframeSrc,
  className,
  defaultView,
  defaultZoom,
  compact,
}: {
  preview?: React.ReactNode;
  code: string;
  language?: string;
  filename?: string;
  meta?: string;
  iframeSrc?: string;
  className?: string;
  defaultView?: import("@/lib/preview-presets").PreviewView;
  defaultZoom?: number;
  compact?: boolean;
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
            tab === "preview"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Eye className="size-3.5" /> Preview
        </button>
        <button
          type="button"
          onClick={() => setTab("code")}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
            tab === "code"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Code2 className="size-3.5" /> Code
        </button>
        {meta && (
          <p className="ml-2 hidden truncate text-xs text-muted-foreground sm:block">{meta}</p>
        )}
      </div>

      {tab === "preview" ? (
        iframeSrc ? (
          <PreviewFrame
            src={iframeSrc}
            defaultView={defaultView}
            defaultZoom={defaultZoom}
            compact={compact}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex min-h-[280px] items-center justify-center bg-zinc-950 p-6">
              {preview ?? (
                <p className="text-xs text-muted-foreground">
                  No preview yet — see Code tab.
                </p>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <CodeBlock code={code} language={language} filename={filename} />
        </div>
      )}
    </div>
  );
}
