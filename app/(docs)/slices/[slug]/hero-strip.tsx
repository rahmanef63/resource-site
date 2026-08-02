"use client";

import { ExternalLink, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/site/copy-button";
import { InstallWithAgent } from "@/components/site/install-with-agent";

export function HeroStrip({
  installCommand, updateCommand, sourceHref, description, agentPrompt,
}: {
  installCommand: string;
  /** `npx rahman-resources update <slug>` — shown as a secondary line so
   *  returning users can re-pull without hunting for the verb. */
  updateCommand?: string;
  sourceHref: string;
  description: string;
  agentPrompt: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Terminal className="size-3.5 shrink-0 text-muted-foreground" />
        <code className="flex-1 min-w-[14rem] truncate rounded bg-background px-2 py-1 font-mono text-xs">
          {installCommand}
        </code>
        <CopyButton value={installCommand} size="icon" className="h-7 w-7 shrink-0" />
        {agentPrompt && (
          <InstallWithAgent prompt={agentPrompt} label="AI install" size="sm" />
        )}
        <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
          <a href={sourceHref} target="_blank" rel="noreferrer">
            Source <ExternalLink className="size-3" />
          </a>
        </Button>
      </div>
      {updateCommand && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
            Already installed?
          </span>
          <code className="flex-1 min-w-[12rem] truncate rounded bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
            {updateCommand}
          </code>
          <CopyButton value={updateCommand} size="icon" className="h-7 w-7 shrink-0" />
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
