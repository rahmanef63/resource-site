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
import { TemplatePicker, type TemplateOption } from "./template-picker";
import { FeaturePicker, type FeatureOption } from "./feature-picker";
import { LivePreview } from "./live-preview";
import { BuildInspector } from "./build-inspector";
import { type ParsedRr } from "./existing-rr-uploader";

/**
 * Page-level state container. Renders nothing visible — work happens via the
 * feature-manifest registered with DocsShell. The DocsShell three-column then
 * wraps everything; left = DocsSidebar (untouched), center = builder canvas,
 * right = consolidated inspector (project form / skills / command output).
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

  // Hydrate selections from uploaded rr.json when in existing mode.
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

  // Compute command blocks per mode — passed into the inspector.
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

  // Default-open the right inspector on /build — it holds the primary controls
  // (project form / skills / command output). Run once on mount.
  const { setRightOpen } = useFeatureContext();
  React.useEffect(() => {
    setRightOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ─── Center pane — 2 vertical sections: pickers (top) + preview (bottom) ──

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
      {/* Top bar — mode tabs + pickers in compact 2-col strip */}
      <div className="border-b bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
            Pickers below ↓ · Setup &amp; Skills in the right panel ↦
          </p>
        </div>

        {/* Pickers row — collapsible accordion lists, side-by-side on wide screens. */}
        <div className="grid grid-cols-1 gap-3 border-t bg-muted/10 px-4 py-3 sm:px-6 lg:grid-cols-2">
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
      </div>

      {/* Live preview takes the rest of the canvas */}
      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        <LivePreview
          templateSlug={sel.template}
          publicPath={tplMeta?.previewPath}
          adminPath={tplMeta?.adminPreviewPath}
          defaultSurface={tplMeta?.defaultSurface}
        />
      </div>
    </div>
  );
}
