"use client";

import * as React from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/site/code-block";
import type { CommandBlock } from "@/lib/build/command-builder";

export function CommandOutput({
  blocks,
  language = "bash",
  filename = "scaffold.sh",
}: {
  blocks: CommandBlock[];
  language?: string;
  filename?: string;
}) {
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Terminal className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Command</h3>
      </div>
      {blocks.map((b, i) => (
        <div key={`${b.heading}-${i}`} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">{b.heading}</p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-[11px]"
              onClick={async () => {
                await navigator.clipboard.writeText(b.script);
                setCopiedIdx(i);
                setTimeout(() => setCopiedIdx((c) => (c === i ? null : c)), 1500);
              }}
            >
              {copiedIdx === i ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copiedIdx === i ? "Copied" : "Copy"}
            </Button>
          </div>
          <CodeBlock code={b.script} language={language} filename={filename} />
        </div>
      ))}
    </div>
  );
}
