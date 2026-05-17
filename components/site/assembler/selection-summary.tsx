"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FeatureManifest, Selections } from "../feature-context";

export function SelectionSummary({
  manifest,
  selections,
}: {
  manifest: FeatureManifest;
  selections: Selections;
}) {
  const items: { label: string; value: string }[] = [];
  for (const g of manifest.config?.groups ?? []) {
    for (const f of g.fields) {
      const v = selections[f.id];
      if (v == null) continue;
      if (typeof v === "boolean") {
        if (v) items.push({ label: f.label, value: "✓" });
      } else if (Array.isArray(v)) {
        if (v.length) items.push({ label: f.label, value: v.join(", ") });
      } else if (v) {
        const opt = "options" in f ? f.options.find((o) => o.id === v) : null;
        items.push({ label: f.label, value: opt?.label ?? String(v) });
      }
    }
  }
  if (!items.length) return null;
  return (
    <div className="rounded-md border bg-muted/30 p-2.5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Current selection
      </p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.label} className="flex items-start justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{it.label}</span>
            <span className="text-right font-mono text-foreground">{it.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CopyPromptButton({
  manifest,
  selections,
}: {
  manifest: FeatureManifest;
  selections: Selections;
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      size="sm"
      className="w-full gap-2"
      onClick={async () => {
        const prompt = manifest.composePrompt
          ? manifest.composePrompt(selections)
          : "(no composer registered)";
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied!" : "Copy prompt"}
      <Badge variant="secondary" className="ml-auto h-4 rounded text-[9px] tabular-nums">
        {Object.keys(selections).length} keys
      </Badge>
    </Button>
  );
}
