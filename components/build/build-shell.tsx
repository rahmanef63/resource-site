"use client";

import * as React from "react";
import { layouts } from "@/lib/content/layouts";
import { isHidden } from "@/lib/content/hidden-slugs";
import {
  EMPTY_SELECTION,
  type BuildSelection,
} from "@/lib/build/types";
import {
  EXISTING_PROJECT_SLUG,
  buildCommands,
  isExistingMode,
} from "@/lib/build/command-builder";
import { collectWarnings } from "@/lib/build/compat";
import { useFeatureContext, useFeatureManifest } from "@/components/site/feature-context";
import { type TemplateOption } from "./template-picker";
import { type FeatureOption } from "./feature-picker";
import { type ParsedRr } from "./existing-rr-uploader";
import { BuilderCenter } from "./builder-center";

/** Sentinel "Existing project" template option — picking it switches the
 *  Project tab into rr.json upload mode and the right panel emits add-commands
 *  instead of init. */
const EXISTING_TEMPLATE: TemplateOption = {
  slug: EXISTING_PROJECT_SLUG,
  title: "Existing project",
  description:
    "I already have an rr.json. Pick features / skills here — the right panel emits the right add-commands to extend my project.",
  category: "existing",
};

/**
 * Page-level state container for /build.
 *
 * Layout hierarchy (color-coded):
 *
 *   OUTER 3-col (DocsShell, tone="layout" → blue):
 *     left  = DocsSidebar (docs nav)
 *     center = BuilderCenter (nested feature-level 3-col below)
 *     right = HIDDEN (no inspector at layout level)
 *
 *   INNER 3-col (BuilderCenter, tone="feature" → muted):
 *     left  = InputsPanel — sub-tabs: Templates / Features / Project / Skills
 *     center = LivePreview iframe (responsive picker = dropdown)
 *     right = CommandOutput (init OR add commands depending on template)
 */
export function BuildShell() {
  const [sel, setSel] = React.useState<BuildSelection>(EMPTY_SELECTION);
  const [rr, setRr] = React.useState<ParsedRr | null>(null);

  const realTemplates: TemplateOption[] = React.useMemo(
    () =>
      layouts
        .filter((l) => l.category === "website-template" && !isHidden(l.slug))
        .map((l) => ({
          slug: l.slug,
          title: l.title,
          description: l.description,
          category: l.category,
          status: l.status ?? "stable",
          previewPath: l.previewPath,
          adminPreviewPath: l.adminPreviewPath,
          defaultSurface: l.defaultSurface,
          tags: l.tags,
        })),
    [],
  );

  // "Existing project" first — easy access for users who already have an rr.json.
  const templates: TemplateOption[] = React.useMemo(
    () => [EXISTING_TEMPLATE, ...realTemplates],
    [realTemplates],
  );

  // Legacy "features" tab is deprecated — slices are the canonical tier-3
  // unit. We keep an empty featureOptions array so the InputsPanel API stays
  // stable; the Features tab has been removed (see inputs-panel.tsx).
  const featureOptions: FeatureOption[] = React.useMemo(() => [], []);

  // Hydrate selections from uploaded rr.json when in existing mode.
  React.useEffect(() => {
    if (!rr || !isExistingMode(sel)) return;
    setSel((s) => ({
      ...s,
      project: {
        ...s.project,
        framework: rr.framework === "sveltekit" ? "svelte-sveltekit" : "react-next",
        packageManager: rr.packageManager === "bun" ? "bun" : "npm",
      },
      slices: Array.from(new Set([...(rr.slices ?? []).map((sl) => sl.slug), ...s.slices])),
      skills: Array.from(new Set([...(rr.skills ?? []).map((s2) => s2.slug), ...s.skills])),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rr]);

  const toggleFeature = React.useCallback((slug: string) => {
    setSel((s) => ({
      ...s,
      features: s.features.includes(slug) ? s.features.filter((x) => x !== slug) : [...s.features, slug],
    }));
  }, []);

  const toggleSlice = React.useCallback((slug: string) => {
    setSel((s) => ({
      ...s,
      slices: s.slices.includes(slug) ? s.slices.filter((x) => x !== slug) : [...s.slices, slug],
    }));
  }, []);

  const toggleSkill = React.useCallback((slug: string) => {
    setSel((s) => ({
      ...s,
      skills: s.skills.includes(slug) ? s.skills.filter((x) => x !== slug) : [...s.skills, slug],
    }));
  }, []);

  const blocks = React.useMemo(() => buildCommands(sel, rr ?? undefined), [sel, rr]);
  const filename = isExistingMode(sel) ? "add-to-existing.sh" : "scaffold.sh";
  const warnings = React.useMemo(
    () => (isExistingMode(sel) ? [] : collectWarnings(sel.template, sel.slices)),
    [sel],
  );

  // Manifest — single tab, no inspector. Outer right panel hidden on /build.
  const manifest = React.useMemo(
    () => ({
      title: "Bundle Builder",
      tabs: [
        {
          id: "builder",
          label: "Builder",
          render: () => (
            <BuilderCenter
              sel={sel}
              setSel={setSel}
              rr={rr}
              setRr={setRr}
              templates={templates}
              featureOptions={featureOptions}
              toggleFeature={toggleFeature}
              toggleSlice={toggleSlice}
              toggleSkill={toggleSkill}
              commandBlocks={blocks}
              filename={filename}
              warnings={warnings}
            />
          ),
        },
      ],
      defaultTab: "builder",
    }),
     
    [sel, rr, templates, featureOptions, toggleFeature, toggleSlice, toggleSkill, blocks, filename, warnings],
  );

  useFeatureManifest(manifest);

  const { setRightOpen } = useFeatureContext();
  React.useEffect(() => {
    setRightOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
