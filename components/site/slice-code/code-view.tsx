"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  path: string;
  content: string;
}

/**
 * Monospace viewer with line numbers + per-file copy. No syntax highlight
 * (keeps bundle small). Wrap-controlled via overflow-x-auto.
 */
export function CodeView({ path, content }: Props) {
  const [copied, setCopied] = React.useState(false);
  const lines = React.useMemo(() => content.split("\n"), [content]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard rejected — silently ignore */
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5 text-[11px]">
        <code className="truncate font-mono text-muted-foreground">{path}</code>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCopy}
          className="h-6 gap-1 px-2 text-[11px]"
        >
          {copied ? (
            <>
              <Check className="size-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="text-[11px] leading-relaxed">
          <code className="block">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span
                  className={cn(
                    "sticky left-0 inline-block min-w-[3rem] shrink-0 select-none border-r bg-muted/20 px-2 py-0.5 text-right text-muted-foreground/60 tabular-nums",
                  )}
                >
                  {i + 1}
                </span>
                <span className="whitespace-pre px-3 py-0.5">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
