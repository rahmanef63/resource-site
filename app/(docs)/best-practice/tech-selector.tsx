"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BEST_PRACTICE_DOCS_REVIEWED,
  BEST_PRACTICE_TECHS,
  activeBestPracticeTechs,
  type BestPracticeSelection,
  type FrontendTechId,
} from "@/lib/content/best-practice-techs";

export function TechSelector({
  selection,
  onChange,
}: {
  selection: BestPracticeSelection;
  onChange: (next: BestPracticeSelection) => void;
}) {
  const activeIds = new Set(activeBestPracticeTechs(selection));
  return (
    <section className="space-y-3" aria-labelledby="technology-profile-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="technology-profile-title" className="text-sm font-semibold">Technology profile</h2>
          <p className="text-xs text-muted-foreground">
            Pick one frontend; Convex is additive. Docs + prompt update together.
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Official docs reviewed {BEST_PRACTICE_DOCS_REVIEWED}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3" aria-label="Best practice technology tabs">
        {(["nextjs", "svelte"] as FrontendTechId[]).map((id) => (
          <TechButton
            key={id}
            id={id}
            active={selection.frontend === id}
            onClick={() => onChange({ ...selection, frontend: id })}
          />
        ))}
        <TechButton
          id="convex"
          active={selection.convex}
          onClick={() => onChange({ ...selection, convex: !selection.convex })}
        />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {[...activeIds].flatMap((id) => BEST_PRACTICE_TECHS[id].docs).map((doc) => (
          <a key={doc.url} href={doc.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
            {doc.label} ↗
          </a>
        ))}
      </div>
    </section>
  );
}

function TechButton({
  id,
  active,
  onClick,
}: {
  id: "nextjs" | "svelte" | "convex";
  active: boolean;
  onClick: () => void;
}) {
  const tech = BEST_PRACTICE_TECHS[id];
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-auto min-h-20 w-full items-start justify-start whitespace-normal px-4 py-3 text-left",
        active && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      <span className="min-w-0 space-y-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold">{tech.label}</span>
          <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px]", active ? "bg-primary-foreground/15" : "bg-muted") }>
            {tech.version}
          </span>
          {active && <span className="text-[10px] uppercase tracking-wider">Active</span>}
        </span>
        <span className={cn("block text-xs font-normal", active ? "text-primary-foreground/75" : "text-muted-foreground") }>
          {tech.summary}
        </span>
        <span className={cn("block text-[10px] font-normal", active ? "text-primary-foreground/60" : "text-muted-foreground") }>
          {tech.companions.join(" · ")}
        </span>
      </span>
    </Button>
  );
}
