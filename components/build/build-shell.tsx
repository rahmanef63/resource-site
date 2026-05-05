"use client";

import * as React from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { layouts } from "@/lib/content/layouts";
import { features as featureCatalog } from "@/lib/content/features";
import {
  EMPTY_SELECTION,
  type BuildSelection,
  type ProjectForm as ProjectFormShape,
} from "@/lib/build/types";
import {
  buildAgentPrompt,
  buildExistingCommands,
  buildInitCommand,
} from "@/lib/build/command-builder";
import { useFeatureManifest } from "@/components/site/feature-context";
import { TemplatePicker, type TemplateOption } from "./template-picker";
import { FeaturePicker, type FeatureOption } from "./feature-picker";
import { SkillsInspector } from "./skills-inspector";
import { ProjectForm } from "./project-form";
import { LivePreview } from "./live-preview";
import { CommandOutput } from "./command-output";
import { ExistingRrUploader, type ParsedRr } from "./existing-rr-uploader";

/** Page-level state container. Renders nothing visible — work happens via feature-manifest. */
export function BuildShell() {
  const [mode, setMode] = React.useState<"new" | "existing">("new");
  const [sel, setSel] = React.useState<BuildSelection>(EMPTY_SELECTION);
  const [rr, setRr] = React.useState<ParsedRr | null>(null);

  const templates: TemplateOption[] = React.useMemo(
    () =>
      layouts
        .filter((l) => l.category === "website-template")
        .map((l) => ({
          slug: l.slug,
          title: l.title,
          description: l.description,
          category: l.category,
          previewPath: l.previewPath,
          adminPreviewPath: l.adminPreviewPath,
          defaultSurface: l.defaultSurface,
          tags: l.tags,
        })),
    [],
  );

  const featureOptions: FeatureOption[] = React.useMemo(
    () =>
      featureCatalog.map((f) => ({
        slug: f.slug,
        title: f.title,
        description: f.description,
        category: f.category,
        usedBy: f.usedBy,
      })),
    [],
  );

  // Existing-mode hydration from uploaded rr.json
  React.useEffect(() => {
    if (!rr || mode !== "existing") return;
    setSel({
      template: rr.template?.slug ?? null,
      features: (rr.features ?? []).map((f) => f.slug),
      skills: (rr.skills ?? []).map((s) => s.slug),
      project: EMPTY_SELECTION.project,
    });
  }, [rr, mode]);

  const toggleFeature = React.useCallback((slug: string) => {
    setSel((s) => ({
      ...s,
      features: s.features.includes(slug) ? s.features.filter((x) => x !== slug) : [...s.features, slug],
    }));
  }, []);

  const toggleSkill = React.useCallback((slug: string) => {
    setSel((s) => ({
      ...s,
      skills: s.skills.includes(slug) ? s.skills.filter((x) => x !== slug) : [...s.skills, slug],
    }));
  }, []);

  // Register the manifest so DocsShell switches to full-width center + opens Inspector slot.
  // Memoize on the data the renderers actually read.
  const manifest = React.useMemo(
    () => ({
      title: "Bundle Builder",
      tabs: [
        {
          id: "builder",
          label: "Builder",
          render: () => (
            <BuilderCenter
              mode={mode}
              setMode={setMode}
              sel={sel}
              setSel={setSel}
              rr={rr}
              setRr={setRr}
              templates={templates}
              featureOptions={featureOptions}
              toggleFeature={toggleFeature}
            />
          ),
        },
      ],
      defaultTab: "builder",
      inspector: {
        title: "Claude Skills",
        render: () => <SkillsInspector selected={sel.skills} onToggle={toggleSkill} />,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, sel, rr, templates, featureOptions, toggleFeature, toggleSkill],
  );

  useFeatureManifest(manifest);
  return null;
}

// ─── Center pane (full-width inside DocsShell) ───────────────────────────

function BuilderCenter({
  mode, setMode,
  sel, setSel,
  rr, setRr,
  templates, featureOptions,
  toggleFeature,
}: {
  mode: "new" | "existing";
  setMode: (m: "new" | "existing") => void;
  sel: BuildSelection;
  setSel: React.Dispatch<React.SetStateAction<BuildSelection>>;
  rr: ParsedRr | null;
  setRr: (rr: ParsedRr | null) => void;
  templates: TemplateOption[];
  featureOptions: FeatureOption[];
  toggleFeature: (slug: string) => void;
}) {
  const tplMeta = templates.find((t) => t.slug === sel.template) ?? null;

  const newBlocks = React.useMemo(
    () => [buildInitCommand(sel), buildAgentPrompt(sel)],
    [sel],
  );

  const additions: BuildSelection = React.useMemo(() => {
    const haveFeatures = new Set((rr?.features ?? []).map((f) => f.slug));
    const haveSkills = new Set((rr?.skills ?? []).map((s) => s.slug));
    return {
      template: !rr?.template?.slug && sel.template ? sel.template : null,
      features: sel.features.filter((s) => !haveFeatures.has(s)),
      skills: sel.skills.filter((s) => !haveSkills.has(s)),
      project: sel.project,
    };
  }, [sel, rr]);

  const existingBlocks = React.useMemo(() => [buildExistingCommands(additions)], [additions]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top header — mode tabs + soft hint */}
      <div className="border-b bg-background px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "new" | "existing")}>
            <TabsList>
              <TabsTrigger value="new" className="gap-1.5">
                <Wand2 className="size-3.5" /> New project
              </TabsTrigger>
              <TabsTrigger value="existing" className="gap-1.5">
                <Sparkles className="size-3.5" /> Existing project
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-[11px] text-muted-foreground">
            Pick a template, check features.{" "}
            <span className="text-foreground">Skills</span> live in the right inspector.
          </p>
        </div>
      </div>

      {/* Body — three inner columns. Pickers | Preview | Form/Output */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 sm:p-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {mode === "existing" && (
            <ExistingRrUploader onParsed={setRr} />
          )}
          <TemplatePicker
            templates={templates}
            selected={sel.template}
            onSelect={(slug) => setSel((s) => ({ ...s, template: slug }))}
          />
          <FeaturePicker
            features={featureOptions}
            selected={sel.features}
            highlightTemplate={sel.template}
            onToggle={toggleFeature}
          />
        </div>

        <div className="space-y-4">
          <LivePreview
            templateSlug={sel.template}
            publicPath={tplMeta?.previewPath}
            adminPath={tplMeta?.adminPreviewPath}
            defaultSurface={tplMeta?.defaultSurface}
          />
        </div>

        <div className="space-y-4">
          {mode === "new" && (
            <ProjectForm
              value={sel.project}
              onChange={(project: ProjectFormShape) => setSel((s) => ({ ...s, project }))}
            />
          )}
          <CommandOutput
            blocks={mode === "new" ? newBlocks : existingBlocks}
            filename={mode === "new" ? "scaffold.sh" : "add-to-existing.sh"}
          />
        </div>
      </div>
    </div>
  );
}
