"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/site/code-block";
import { DocCard } from "@/components/site/doc-primitives";

export function PromptPanel({ prompt }: { prompt: string }) {
  return (
    <div className="space-y-4">
      <DocCard className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Dynamic one-paste agent prompt</h2>
            <p className="text-xs text-muted-foreground">
              Generated from the active technology profile + the shared doctrine. No duplicated prompt variants.
            </p>
          </div>
          <CopyButton text={prompt} />
        </div>
        <CodeBlock code={prompt} language="markdown" filename="rr-best-practice.prompt.md" />
      </DocCard>
      <details className="rounded-lg border bg-card p-4 text-sm">
        <summary className="cursor-pointer font-semibold">How to use</summary>
        <div className="mt-3 space-y-2 text-muted-foreground">
          <p>Paste it into your AI coding session or save it as the project agent/rules instruction.</p>
          <p>When the selected stack changes, copy again—the prompt contains the exact active profile and reviewed official references.</p>
        </div>
      </details>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <Button size="sm" variant="outline" onClick={copy} className="shrink-0">
      {copied ? <><Check className="size-3.5" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
    </Button>
  );
}
