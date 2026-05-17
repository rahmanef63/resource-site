"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  repoUrl,
  selectionsToQuery,
  useFeatureContext,
} from "./feature-context";
import { FieldControl } from "./assembler/field-control";
import { CopyPromptButton, SelectionSummary } from "./assembler/selection-summary";

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

// re-export selectionsToQuery for convenience
export { selectionsToQuery };
