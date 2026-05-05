"use client";

import * as React from "react";
import { ChevronRight, Settings2, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BuildSelection, ProjectForm as ProjectFormShape } from "@/lib/build/types";
import type { CommandBlock } from "@/lib/build/command-builder";
import { ProjectForm } from "./project-form";
import { SkillsInspector } from "./skills-inspector";
import { CommandOutput } from "./command-output";
import { ExistingRrUploader, type ParsedRr } from "./existing-rr-uploader";

/**
 * Right-side inspector for the builder. Consolidated config + output:
 *   • Tabs at top: [Setup] [Skills]
 *   • Command output sticky at bottom — always visible while you tweak.
 *
 * In "existing" mode the Setup tab swaps the project form for the rr.json uploader.
 */
export function BuildInspector({
  mode,
  sel,
  setSel,
  rr,
  setRr,
  toggleSkill,
  commandBlocks,
  filename,
}: {
  mode: "new" | "existing";
  sel: BuildSelection;
  setSel: React.Dispatch<React.SetStateAction<BuildSelection>>;
  rr: ParsedRr | null;
  setRr: (rr: ParsedRr | null) => void;
  toggleSkill: (slug: string) => void;
  commandBlocks: CommandBlock[];
  filename: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs defaultValue="setup" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="m-2 grid grid-cols-2">
          <TabsTrigger value="setup" className="gap-1.5 text-[11px]">
            <Settings2 className="size-3" /> Setup
            {sel.features.length > 0 && (
              <span className="ml-1 rounded-full bg-foreground/10 px-1.5 text-[9px]">
                {sel.features.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-1.5 text-[11px]">
            <Sparkles className="size-3" /> Skills
            {sel.skills.length > 0 && (
              <span className="ml-1 rounded-full bg-foreground/10 px-1.5 text-[9px]">
                {sel.skills.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="m-0 flex-1 overflow-auto px-3 pb-3">
          {mode === "new" ? (
            <ProjectForm
              value={sel.project}
              onChange={(project: ProjectFormShape) => setSel((s) => ({ ...s, project }))}
            />
          ) : (
            <ExistingRrUploader onParsed={setRr} />
          )}
          {mode === "existing" && rr && (
            <p className="mt-3 flex items-start gap-1 text-[10px] text-muted-foreground">
              <ChevronRight className="mt-0.5 size-3" />
              Pickers below the preview show what you'll{" "}
              <span className="text-foreground">add</span> to this project.
            </p>
          )}
        </TabsContent>

        <TabsContent value="skills" className="m-0 flex-1 overflow-auto px-3 pb-3">
          <SkillsInspector selected={sel.skills} onToggle={toggleSkill} />
        </TabsContent>
      </Tabs>

      {/* Command output sticky bottom — always visible across tabs */}
      <div className="border-t bg-muted/20 p-3">
        <CommandOutput blocks={commandBlocks} filename={filename} />
      </div>
    </div>
  );
}
