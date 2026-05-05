"use client";

import * as React from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { layouts } from "@/lib/content/layouts";
import { features as featureCatalog } from "@/lib/content/features";
import {
  EMPTY_SELECTION,
  type BuildSelection,
} from "@/lib/build/types";
import {
  buildAgentPrompt,
  buildExistingCommands,
  buildInitCommand,
} from "@/lib/build/command-builder";
import { useFeatureContext, useFeatureManifest } from "@/components/site/feature-context";
import { ThreeColumnLayoutAdvanced } from "@/components/previews/three-column/ThreeColumnLayout";
import { TemplatePicker, type TemplateOption } from "./template-picker";
import { FeaturePicker, type FeatureOption } from "./feature-picker";
import { LivePreview } from "./live-preview";
import { BuildInspector } from "./build-inspector";
import { type ParsedRr } from "./existing-rr-uploader";

/**
 * Page-level state container for /build.
 *
 * Layout hierarchy (color-coded so users don't conflate the two):
 *
 *   OUTER 3-col (DocsShell, tone="layout" → blue):
 *     left  = DocsSidebar (docs nav)
 *     center = BuilderCenter (this file's nested 3-col below)
 *     right = BuildInspector (project form / skills tabs / sticky command)
 *
 *   INNER 3-col (BuilderCenter, tone="feature" → muted):
 *     left  = TemplatePicker
 *     center = LivePreview
 *     right = FeaturePicker
 */
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

  const newBlocks = React.useMemo(() => [buildInitCommand(sel), buildAgentPrompt(sel)], [sel]);
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
              templates={templates}
              featureOptions={featureOptions}
              toggleFeature={toggleFeature}
            />
          ),
        },
      ],
      defaultTab: "builder",
      inspector: {
        title: "Setup",
        render: () => (
          <BuildInspector
            mode={mode}
            sel={sel}
            setSel={setSel}
            rr={rr}
            setRr={setRr}
            toggleSkill={toggleSkill}
            commandBlocks={mode === "new" ? newBlocks : existingBlocks}
            filename={mode === "new" ? "scaffold.sh" : "add-to-existing.sh"}
          />
        ),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, sel, rr, templates, featureOptions, toggleFeature, toggleSkill, newBlocks, existingBlocks],
  );

  useFeatureManifest(manifest);

  const { setRightOpen } = useFeatureContext();
  React.useEffect(() => {
    setRightOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ─── Inner nested 3-col canvas ────────────────────────────────────────────

function BuilderCenter({
  mode, setMode,
  sel, setSel,
  templates, featureOptions,
  toggleFeature,
}: {
  mode: "new" | "existing";
  setMode: (m: "new" | "existing") => void;
  sel: BuildSelection;
  setSel: React.Dispatch<React.SetStateAction<BuildSelection>>;
  templates: TemplateOption[];
  featureOptions: FeatureOption[];
  toggleFeature: (slug: string) => void;
}) {
  const tplMeta = templates.find((t) => t.slug === sel.template) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Mode tabs sit ABOVE the inner 3-col, full width of center */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background px-4 py-2 sm:px-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "new" | "existing")}>
          <TabsList className="h-8">
            <TabsTrigger value="new" className="h-7 gap-1.5 text-[11px]">
              <Wand2 className="size-3.5" /> New project
            </TabsTrigger>
            <TabsTrigger value="existing" className="h-7 gap-1.5 text-[11px]">
              <Sparkles className="size-3.5" /> Existing project
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-[11px] text-muted-foreground">
          Templates ← preview → Features · setup &amp; skills in the right panel ↦
        </p>
      </div>

      {/* Inner 3-column. tone="feature" → muted headers (default). */}
      <div className="min-h-0 flex-1">
        <ThreeColumnLayoutAdvanced
          left={<div className="p-3"><TemplatePicker
            templates={templates}
            selected={sel.template}
            onSelect={(slug) => setSel((s) => ({ ...s, template: slug }))}
          /></div>}
          center={(
            <div className="h-full overflow-auto p-3 sm:p-4">
              <LivePreview
                templateSlug={sel.template}
                publicPath={tplMeta?.previewPath}
                adminPath={tplMeta?.adminPreviewPath}
                defaultSurface={tplMeta?.defaultSurface}
              />
            </div>
          )}
          right={<div className="p-3"><FeaturePicker
            features={featureOptions}
            selected={sel.features}
            highlightTemplate={sel.template}
            onToggle={toggleFeature}
          /></div>}
          leftLabel="Templates"
          rightLabel="Features"
          leftWidth={260}
          rightWidth={260}
          centerMinWidth={320}
          showCollapseButtons
          resizable
          persistState
          storageKey="builder-inner-v1"
          tone="feature"
          className="h-full"
        />
      </div>
    </div>
  );
}
