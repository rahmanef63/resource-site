"use client";
/* Spotlight result row — split out of spotlight.tsx to keep it under the 200 LOC
   gate. Renders one command hit: app hits keep their existing gradient tile,
   everything else gets a monochrome phosphor glyph in a neutral tile (real
   Spotlight uses flat SF-symbol icons, not emoji). Selected row is a solid
   accent-blue full-row highlight with white text (Sonoma spec), including the
   trailing hint. */
import { Folder, Globe, Equals as Equal, Lightning as Zap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Command } from "../lib";

const HINT_ICON: Record<string, typeof Folder> = {
  Folder: Folder,
  Web: Globe,
  Result: Equal,
  Convert: Equal,
};

export function SpotlightRow({
  cmd,
  index,
  selected,
  onHover,
  onRun,
}: {
  cmd: Command;
  index: number;
  selected: boolean;
  onHover: () => void;
  onRun: () => void;
}) {
  const HintIcon = cmd.app ? null : (HINT_ICON[cmd.hint] ?? Zap);
  return (
    <li id={`spotlight-option-${index}`} role="option" aria-selected={selected}>
      <Button
        type="button"
        variant="ghost"
        onMouseMove={onHover}
        onClick={onRun}
        className={cn(
          "h-auto flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
          selected ? "bg-[var(--os-accent)] text-white hover:bg-[var(--os-accent)] hover:text-white" : "text-foreground/80",
        )}
      >
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-md text-xs font-bold",
            cmd.app ? "text-white" : "bg-muted text-muted-foreground",
          )}
          style={cmd.app ? { background: cmd.app.gradient ?? "var(--os-accent)" } : undefined}
        >
          {HintIcon && <HintIcon className="size-4" />}
        </span>
        <span className="flex-1 truncate">{cmd.label}</span>
        <span className={cn("text-[11px]", selected ? "text-white/80" : "text-muted-foreground")}>{cmd.hint}</span>
      </Button>
    </li>
  );
}
