"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, RefreshCcw } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  repoUrl,
  selectionsToQuery,
  useFeatureContext,
  type ConfigField,
  type FeatureManifest,
  type Selections,
} from "./feature-context";

export function AssemblerInspector() {
  const { manifest, selections, setSelection, resetSelections } = useFeatureContext();
  if (!manifest) return null;

  return (
    <div className="space-y-5 text-sm">
      <header className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Assemble
        </p>
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[11px]" onClick={resetSelections}>
          <RefreshCcw className="size-3" /> Reset
        </Button>
      </header>

      {manifest.config?.groups.map((g) => (
        <section key={g.label} className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {g.label}
          </p>
          {g.fields.map((f) => (
            <FieldControl key={f.id} field={f} value={selections[f.id]} onChange={(v) => setSelection(f.id, v)} />
          ))}
        </section>
      ))}

      <SelectionSummary manifest={manifest} selections={selections} />

      <div className="space-y-2">
        <CopyPromptButton manifest={manifest} selections={selections} />
        {manifest.sourceRepo && (
          <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
            <Link href={repoUrl(manifest.sourceRepo)} target="_blank" rel="noopener noreferrer">
              <Github className="size-3.5" />
              <span className="truncate font-mono text-xs">{manifest.sourceRepo.path}</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Field controls
// ---------------------------------------------------------------------

function FieldControl({
  field, value, onChange,
}: {
  field: ConfigField;
  value: string | boolean | string[] | undefined;
  onChange: (v: string | boolean | string[]) => void;
}) {
  if (field.type === "radio") {
    const cur = (value as string) ?? field.default;
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium">{field.label}</p>
        <div className="space-y-1">
          {field.options.map((o) => (
            <label key={o.id} className="flex cursor-pointer items-start gap-2 rounded-md border p-2 hover:bg-accent/40">
              <input
                type="radio"
                name={field.id}
                value={o.id}
                checked={cur === o.id}
                onChange={() => onChange(o.id)}
                className="mt-0.5 accent-foreground"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{o.label}</p>
                {o.desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{o.desc}</p>}
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-medium">{field.label}</span>
        <select
          value={(value as string) ?? field.default}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border bg-background px-2 py-1.5 text-xs"
        >
          {field.options.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "check") {
    const cur = (value as boolean) ?? field.default ?? false;
    return (
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={cur}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 accent-foreground"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">{field.label}</p>
          {field.desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{field.desc}</p>}
        </div>
      </label>
    );
  }

  if (field.type === "multi") {
    const cur = (value as string[]) ?? field.default ?? [];
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium">{field.label}</p>
        <div className="flex flex-wrap gap-1">
          {field.options.map((o) => {
            const on = cur.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => onChange(on ? cur.filter((x) => x !== o.id) : [...cur, o.id])}
                className={
                  "rounded-full border px-2 py-0.5 text-[11px] transition-colors " +
                  (on ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground")
                }
              >
                {on && <Check className="-ml-0.5 mr-0.5 inline size-2.5" />}
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------
// Selection summary
// ---------------------------------------------------------------------

function SelectionSummary({ manifest, selections }: { manifest: FeatureManifest; selections: Selections }) {
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

// ---------------------------------------------------------------------
// Copy prompt button
// ---------------------------------------------------------------------

function CopyPromptButton({ manifest, selections }: { manifest: FeatureManifest; selections: Selections }) {
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

// re-export selectionsToQuery for convenience
export { selectionsToQuery };
