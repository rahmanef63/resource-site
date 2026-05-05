"use client";

import * as React from "react";
import { Layers, Sparkles, Wand2 } from "lucide-react";
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
import { TemplateRadio, type TemplateOption } from "@/components/build/template-radio";
import { FeatureChecklist, type FeatureOption } from "@/components/build/feature-checklist";
import { SkillsChecklist } from "@/components/build/skills-checklist";
import { ProjectForm } from "@/components/build/project-form";
import { LivePreview } from "@/components/build/live-preview";
import { CommandOutput } from "@/components/build/command-output";
import { ExistingRrUploader, type ParsedRr } from "@/components/build/existing-rr-uploader";

// Legacy prop kept so the existing /build page (which feeds {slug,title,description,kind}
// items) doesn't break — we ignore it now and read directly from layouts/features.
type LegacyItem = { slug: string; title: string; description: string; kind: "layout" | "recipe" };

export function BundleBuilder({ items: _items }: { items?: LegacyItem[] } = {}) {
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Catalog · Build</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Layers className="size-6" /> Bundle Builder
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pick a template, check features, pick Claude skills. Get a single{" "}
          <code className="rounded bg-muted px-1">npx rahman-resources</code> command — or a list of
          add-commands for an existing <code className="rounded bg-muted px-1">rr.json</code> project.
        </p>
      </header>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new" className="gap-1.5">
            <Wand2 className="size-3.5" /> New project
          </TabsTrigger>
          <TabsTrigger value="existing" className="gap-1.5">
            <Sparkles className="size-3.5" /> Existing project
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="m-0">
          <NewProjectPane templates={templates} featureOptions={featureOptions} />
        </TabsContent>
        <TabsContent value="existing" className="m-0">
          <ExistingProjectPane templates={templates} featureOptions={featureOptions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── New project pane ─────────────────────────────────────────────────────

function NewProjectPane({
  templates,
  featureOptions,
}: {
  templates: TemplateOption[];
  featureOptions: FeatureOption[];
}) {
  const [sel, setSel] = React.useState<BuildSelection>(EMPTY_SELECTION);

  const tplMeta = templates.find((t) => t.slug === sel.template) ?? null;

  const blocks = React.useMemo(
    () => [buildInitCommand(sel), buildAgentPrompt(sel)],
    [sel],
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr_300px]">
      {/* Left: pickers */}
      <div className="space-y-5">
        <TemplateRadio
          templates={templates}
          selected={sel.template}
          onSelect={(slug) => setSel((s) => ({ ...s, template: slug }))}
        />
        <FeatureChecklist
          features={featureOptions}
          selected={sel.features}
          highlightTemplate={sel.template}
          onToggle={(slug) =>
            setSel((s) => ({
              ...s,
              features: s.features.includes(slug)
                ? s.features.filter((x) => x !== slug)
                : [...s.features, slug],
            }))
          }
        />
      </div>

      {/* Center: live preview + project form + command */}
      <div className="space-y-5">
        <LivePreview
          templateSlug={sel.template}
          publicPath={tplMeta?.previewPath}
          adminPath={tplMeta?.adminPreviewPath}
          defaultSurface={tplMeta?.defaultSurface}
        />
        <ProjectForm
          value={sel.project}
          onChange={(project: ProjectFormShape) => setSel((s) => ({ ...s, project }))}
        />
        <CommandOutput blocks={blocks} />
      </div>

      {/* Right: skills */}
      <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
        <SkillsChecklist
          selected={sel.skills}
          onToggle={(slug) =>
            setSel((s) => ({
              ...s,
              skills: s.skills.includes(slug) ? s.skills.filter((x) => x !== slug) : [...s.skills, slug],
            }))
          }
        />
      </div>
    </div>
  );
}

// ─── Existing project pane ────────────────────────────────────────────────

function ExistingProjectPane({
  templates,
  featureOptions,
}: {
  templates: TemplateOption[];
  featureOptions: FeatureOption[];
}) {
  const [sel, setSel] = React.useState<BuildSelection>(EMPTY_SELECTION);
  const [rr, setRr] = React.useState<ParsedRr | null>(null);

  // When an rr.json is parsed, prefill `sel` so the user only checks NEW
  // additions and the diff is visible in the command output.
  React.useEffect(() => {
    if (!rr) return;
    setSel({
      template: rr.template?.slug ?? null,
      features: (rr.features ?? []).map((f) => f.slug),
      skills: (rr.skills ?? []).map((s) => s.slug),
      project: EMPTY_SELECTION.project,
    });
  }, [rr]);

  // What's in `sel` that's NOT in the parsed rr — those are the items to add.
  const additions: BuildSelection = React.useMemo(() => {
    const haveFeatures = new Set((rr?.features ?? []).map((f) => f.slug));
    const haveSkills = new Set((rr?.skills ?? []).map((s) => s.slug));
    const keepTemplate = !rr?.template?.slug && sel.template ? sel.template : null;
    return {
      template: keepTemplate,
      features: sel.features.filter((s) => !haveFeatures.has(s)),
      skills: sel.skills.filter((s) => !haveSkills.has(s)),
      project: sel.project,
    };
  }, [sel, rr]);

  const blocks = React.useMemo(() => [buildExistingCommands(additions)], [additions]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr_300px]">
      <div className="space-y-5">
        <ExistingRrUploader onParsed={setRr} />
        <TemplateRadio
          templates={templates}
          selected={sel.template}
          onSelect={(slug) => setSel((s) => ({ ...s, template: slug }))}
        />
        <FeatureChecklist
          features={featureOptions}
          selected={sel.features}
          highlightTemplate={sel.template}
          onToggle={(slug) =>
            setSel((s) => ({
              ...s,
              features: s.features.includes(slug) ? s.features.filter((x) => x !== slug) : [...s.features, slug],
            }))
          }
        />
      </div>

      <div className="space-y-5">
        <CommandOutput blocks={blocks} filename="add-to-existing.sh" />
      </div>

      <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
        <SkillsChecklist
          selected={sel.skills}
          onToggle={(slug) =>
            setSel((s) => ({
              ...s,
              skills: s.skills.includes(slug) ? s.skills.filter((x) => x !== slug) : [...s.skills, slug],
            }))
          }
        />
      </div>
    </div>
  );
}
