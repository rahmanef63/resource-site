"use client";

import * as React from "react";
import { FileJson, Layers, Puzzle, Settings2, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CLAUDE_SKILLS } from "@/lib/content/claude-skills";
import { slices as sliceCatalog } from "@/lib/content/slices";
import { EXISTING_PROJECT_SLUG } from "@/lib/build/command-builder";
import type { BuildSelection, ProjectForm as ProjectFormShape } from "@/lib/build/types";
import { TemplatePicker, type TemplateOption } from "./template-picker";
import { type FeatureOption } from "./feature-picker";
import { SlicePicker } from "./slice-picker";
import { ProjectForm } from "./project-form";
import { ExistingRrUploader, type ParsedRr } from "./existing-rr-uploader";
import { SkillsInspector } from "./skills-inspector";

/**
 * Inner-left panel for /build — consolidates ALL inputs into 4 sub-tabs:
 *   • Templates  — radio (incl. "Existing project" sentinel)
 *   • Features   — checkboxes (gated until a template is picked)
 *   • Project    — form OR rr.json uploader (depending on template choice)
 *   • Skills     — Claude skills checklist grouped by category
 */
export function InputsPanel({
  templates,
  featureOptions,
  sel,
  setSel,
  rr,
  setRr,
  toggleFeature,
  toggleSlice,
  toggleSkill,
}: {
  templates: TemplateOption[];
  featureOptions: FeatureOption[];
  sel: BuildSelection;
  setSel: React.Dispatch<React.SetStateAction<BuildSelection>>;
  rr: ParsedRr | null;
  setRr: (rr: ParsedRr | null) => void;
  toggleFeature: (slug: string) => void;
  toggleSlice: (slug: string) => void;
  toggleSkill: (slug: string) => void;
}) {
  const isExisting = sel.template === EXISTING_PROJECT_SLUG;
  const templateChosen = sel.template !== null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs defaultValue="templates" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="m-2 grid grid-cols-4">
          <TabTrigger
            value="templates"
            icon={<Layers className="size-3" />}
            label="Tmpl"
            count={sel.template ? 1 : 0}
          />
          <TabTrigger
            value="slices"
            icon={<Puzzle className="size-3" />}
            label="Slices"
            count={sel.slices.length}
            countTotal={sliceCatalog.length}
          />
          <TabTrigger
            value="project"
            icon={isExisting ? <FileJson className="size-3" /> : <Settings2 className="size-3" />}
            label="Proj"
            badge={isExisting && rr ? "✓" : undefined}
          />
          <TabTrigger
            value="skills"
            icon={<Sparkles className="size-3" />}
            label="Skills"
            count={sel.skills.length}
            countTotal={CLAUDE_SKILLS.length}
          />
        </TabsList>

        <TabsContent value="templates" className="m-0 flex-1 overflow-auto px-3 pb-3">
          <TemplatePicker
            templates={templates}
            selected={sel.template}
            onSelect={(slug) => setSel((s) => ({ ...s, template: slug }))}
          />
        </TabsContent>

        <TabsContent value="slices" className="m-0 flex-1 overflow-auto px-3 pb-3">
          <SlicePicker selected={sel.slices} onToggle={toggleSlice} />
        </TabsContent>

        <TabsContent value="project" className="m-0 flex-1 overflow-auto px-3 pb-3">
          {isExisting ? (
            <ExistingRrUploader onParsed={setRr} />
          ) : !templateChosen ? (
            <EmptyHint>
              Pick <span className="text-foreground">Existing project</span> if you already have an
              rr.json, or any template above to scaffold a fresh app.
            </EmptyHint>
          ) : (
            <ProjectForm
              value={sel.project}
              onChange={(project: ProjectFormShape) => setSel((s) => ({ ...s, project }))}
            />
          )}
        </TabsContent>

        <TabsContent value="skills" className="m-0 flex-1 overflow-auto px-3 pb-3">
          <SkillsInspector selected={sel.skills} onToggle={toggleSkill} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabTrigger({
  value, icon, label, count, countTotal, badge, disabled,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  countTotal?: number;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <TabsTrigger value={value} disabled={disabled} className="h-7 gap-1 px-1.5 text-[10px]">
      <span className={cn("flex items-center gap-1", disabled && "opacity-60")}>{icon} {label}</span>
      {count != null && count > 0 && (
        <Badge variant="secondary" className="h-3.5 rounded-full px-1 text-[9px]">
          {countTotal != null ? `${count}/${countTotal}` : count}
        </Badge>
      )}
      {badge && (
        <Badge variant="secondary" className="h-3.5 rounded-full px-1 text-[9px]">{badge}</Badge>
      )}
    </TabsTrigger>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed bg-muted/20 p-3 text-[11px] text-muted-foreground">
      {children}
    </div>
  );
}
