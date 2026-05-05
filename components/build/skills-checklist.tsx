"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CLAUDE_SKILLS, SKILL_CATEGORIES, type ClaudeSkill, type SkillCategory } from "@/lib/content/claude-skills";

export function SkillsChecklist({
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Claude Skills</h3>
        <Badge variant="secondary" className="rounded-full text-[10px]">
          {selected.length} / {CLAUDE_SKILLS.length}
        </Badge>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Drop into <code className="rounded bg-muted px-1">.claude/skills/</code>. From{" "}
        <a className="underline" href="https://github.com/anthropics/skills" target="_blank" rel="noreferrer">
          anthropics/skills
        </a>
        .
      </p>

      <div className="space-y-3">
        {SKILL_CATEGORIES.map((cat) => {
          const list = grouped.get(cat) ?? [];
          if (!list.length) return null;
          return (
            <div key={cat}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {cat}
              </p>
              <ul className="space-y-1">
                {list.map((s) => {
                  const on = selected.includes(s.slug);
                  return (
                    <li key={s.slug}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded-md border bg-card p-2 transition-colors",
                          on && "border-foreground/40 bg-accent/30",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => onToggle(s.slug)}
                          className="mt-0.5 size-3.5 cursor-pointer accent-foreground"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs font-medium">{s.title}</span>
                            {s.source === "rahman" && (
                              <Badge variant="outline" className="rounded-full text-[9px]">rahman</Badge>
                            )}
                          </span>
                          <span className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                            {s.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
