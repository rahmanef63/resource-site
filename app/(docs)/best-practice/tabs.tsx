"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocCard } from "@/components/site/doc-primitives";
import type { BestPracticeSection, BestPracticeTier } from "@/lib/content/best-practices";
import {
  DEFAULT_BEST_PRACTICE_SELECTION,
  appliesToSelection,
  bestPracticeSelectionKey,
  type BestPracticeSelection,
} from "@/lib/content/best-practice-techs";
import { TechSelector } from "./tech-selector";
import { PromptPanel } from "./prompt-panel";

const TIER_STYLES: Record<BestPracticeTier, string> = {
  P0: "bg-destructive/10 text-destructive border-destructive/30",
  P1: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  P2: "bg-muted text-muted-foreground border-border",
};

type Props = {
  sections: BestPracticeSection[];
  prompts: Record<string, string>;
};

export function BestPracticeTabs({ sections, prompts }: Props) {
  const [selection, setSelection] = useState<BestPracticeSelection>(DEFAULT_BEST_PRACTICE_SELECTION);
  const visible = useMemo(() => filterSections(sections, selection), [sections, selection]);
  const prompt = prompts[bestPracticeSelectionKey(selection)] ?? "";
  return (
    <div className="space-y-6">
      <TechSelector selection={selection} onChange={setSelection} />
      <Tabs defaultValue="docs" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="ai-prompt">AI Prompt</TabsTrigger>
        </TabsList>
        <TabsContent value="docs" className="mt-6 space-y-10">
          {visible.map((section) => <DocsSection key={section.id} section={section} />)}
        </TabsContent>
        <TabsContent value="ai-prompt" className="mt-6">
          <PromptPanel prompt={prompt} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function filterSections(sections: BestPracticeSection[], selection: BestPracticeSelection) {
  return sections.flatMap((section) => {
    if (!appliesToSelection(section.appliesTo, selection)) return [];
    const rules = section.rules.filter((rule) => appliesToSelection(rule.appliesTo, selection));
    return rules.length ? [{ ...section, rules }] : [];
  });
}

function DocsSection({ section }: { section: BestPracticeSection }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          {section.title}{section.tier && <TierBadge tier={section.tier} />}
        </h2>
        {section.intro && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{section.intro}</p>}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {section.rules.map((rule) => (
          <DocCard key={rule.title} className="min-w-0 space-y-2 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              {rule.tier && <TierBadge tier={rule.tier} />}{rule.title}
            </h3>
            <p className="text-sm text-muted-foreground">{rule.rule}</p>
            {rule.why && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Why:</span> {rule.why}</p>}
            {rule.example && <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{rule.example}</pre>}
          </DocCard>
        ))}
      </div>
    </section>
  );
}

function TierBadge({ tier }: { tier: BestPracticeTier }) {
  return <span className={`inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${TIER_STYLES[tier]}`}>{tier}</span>;
}
