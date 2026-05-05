"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CLAUDE_SKILLS, SKILL_CATEGORIES, type ClaudeSkill, type SkillCategory } from "@/lib/content/claude-skills";

/** Right-inspector skills list. Grouped by category, accordion-collapsed. */
export function SkillsInspector({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const grouped = React.useMemo(() => {
    const map = new Map<SkillCategory, ClaudeSkill[]>();
    for (const c of SKILL_CATEGORIES) map.set(c, []);
    for (const s of CLAUDE_SKILLS) map.get(s.category)?.push(s);
    return map;
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Drop into <code className="rounded bg-muted px-1">.claude/skills/</code>. From{" "}
        <a className="underline" href="https://github.com/anthropics/skills" target="_blank" rel="noreferrer">
          anthropics/skills
        </a>
        . {selected.length}/{CLAUDE_SKILLS.length} selected.
      </p>

      <Accordion type="multiple" defaultValue={["development"]} className="space-y-1">
        {SKILL_CATEGORIES.map((cat) => {
          const list = grouped.get(cat) ?? [];
          if (!list.length) return null;
          const pickedInCat = list.filter((s) => selected.includes(s.slug)).length;
          return (
            <AccordionItem key={cat} value={cat} className="rounded-md border bg-card">
              <AccordionTrigger className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground hover:no-underline">
                <span className="flex items-center gap-2">
                  {cat}
                  <Badge variant="secondary" className="rounded-full text-[9px]">
                    {pickedInCat}/{list.length}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2 pt-0">
                <ul className="space-y-1">
                  {list.map((s) => {
                    const on = selected.includes(s.slug);
                    return (
                      <li key={s.slug}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-start gap-2 rounded-sm px-1.5 py-1 transition-colors",
                            on ? "bg-accent/40" : "hover:bg-accent/20",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => onToggle(s.slug)}
                            className="mt-0.5 size-3 cursor-pointer accent-foreground"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1">
                              <span className="truncate text-[11px] font-medium">{s.title}</span>
                              {s.source === "rahman" && (
                                <Badge variant="outline" className="rounded-full text-[9px]">rahman</Badge>
                              )}
                            </span>
                            <span className="line-clamp-2 text-[10px] text-muted-foreground">
                              {s.description}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
