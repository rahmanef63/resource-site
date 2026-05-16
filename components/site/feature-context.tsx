"use client";

import * as React from "react";

export type FeatureTab = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  render: () => React.ReactNode;
};

// ---------------------------------------------------------------------
// Config schema — fields the user can tweak per template
// ---------------------------------------------------------------------

export type ConfigOption = { id: string; label: string; desc?: string };

export type ConfigField =
  | { type: "radio";  id: string; label: string; options: ConfigOption[]; default: string }
  | { type: "select"; id: string; label: string; options: ConfigOption[]; default: string }
  | { type: "check";  id: string; label: string; default?: boolean; desc?: string }
  | { type: "multi";  id: string; label: string; options: ConfigOption[]; default?: string[] };

export type ConfigGroup = { label: string; fields: ConfigField[] };
export type ConfigSchema = { groups: ConfigGroup[] };

export type Selections = Record<string, string | boolean | string[]>;

// ---------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------

export type FeatureManifest = {
  title?: string;
  subtitle?: string;
  tabs?: FeatureTab[];
  defaultTab?: string;
  /** show responsive size controls in feature bar (only relevant if active tab is "preview") */
  responsive?: boolean;
  /** initial preview view when manifest mounts. Fallback "desktop". */
  defaultView?: import("@/lib/preview-presets").PreviewView;
  /** initial preview zoom when manifest mounts. Fallback 0.7. */
  defaultZoom?: number;
  /** repo path on rahmanef63/resource-site — used by inspector "View source" */
  sourceRepo?: { owner: string; repo: string; branch?: string; path: string };
  /** when set, right panel is enabled (closed by default until user opens) */
  inspector?: {
    title?: string;
    render: () => React.ReactNode;
  };
  /** assembler config — selections feed preview iframe + composed prompt */
  config?: ConfigSchema;
  /** compose dynamic prompt from selections */
  composePrompt?: (selections: Selections) => string;
  /** compute preview src given selections */
  composePreviewSrc?: (selections: Selections, basePath: string) => string;
  /** when true, no-tabs pages render full-width instead of max-w-3xl. Useful for catalog grids. */
  wide?: boolean;
};

type Ctx = {
  manifest: FeatureManifest | null;
  setManifest: (m: FeatureManifest | null) => void;
  activeTab: string | null;
  setActiveTab: (id: string) => void;
  rightOpen: boolean;
  setRightOpen: (b: boolean) => void;
  previewView: import("@/lib/preview-presets").PreviewView;
  setPreviewView: (v: import("@/lib/preview-presets").PreviewView) => void;
  previewOrientation: import("@/lib/preview-presets").PreviewOrientation;
  setPreviewOrientation: (o: import("@/lib/preview-presets").PreviewOrientation) => void;
  togglePreviewOrientation: () => void;
  previewZoom: number;
  setPreviewZoom: (z: number) => void;
  selections: Selections;
  setSelection: (id: string, value: string | boolean | string[]) => void;
  resetSelections: () => void;
};

const FeatureCtx = React.createContext<Ctx | null>(null);

function defaultsFromSchema(schema: ConfigSchema | undefined): Selections {
  if (!schema) return {};
  const out: Selections = {};
  for (const g of schema.groups) {
    for (const f of g.fields) {
      if (f.type === "radio" || f.type === "select") out[f.id] = f.default;
      else if (f.type === "check") out[f.id] = f.default ?? false;
      else if (f.type === "multi") out[f.id] = f.default ?? [];
    }
  }
  return out;
}

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [manifest, setManifest] = React.useState<FeatureManifest | null>(null);
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [rightOpen, setRightOpen] = React.useState(false);
  const [previewView, setPreviewView] = React.useState<import("@/lib/preview-presets").PreviewView>("desktop");
  const [previewOrientation, setPreviewOrientation] =
    React.useState<import("@/lib/preview-presets").PreviewOrientation>("portrait");
  const togglePreviewOrientation = React.useCallback(() => {
    setPreviewOrientation((o) => (o === "portrait" ? "landscape" : "portrait"));
  }, []);
  const [previewZoom, setPreviewZoom] = React.useState(0.7);
  const [selections, setSelections] = React.useState<Selections>({});

  React.useEffect(() => {
    if (!manifest) {
      setActiveTab(null);
      setSelections({});
      return;
    }
    if (manifest.tabs && manifest.tabs.length > 0) {
      setActiveTab(manifest.defaultTab ?? manifest.tabs[0].id);
    } else {
      setActiveTab(null);
    }
    setSelections(defaultsFromSchema(manifest.config));
    if (manifest.defaultView) setPreviewView(manifest.defaultView);
    if (typeof manifest.defaultZoom === "number") setPreviewZoom(manifest.defaultZoom);
    setPreviewOrientation("portrait");
  }, [manifest]);

  const setSelection = React.useCallback((id: string, value: string | boolean | string[]) => {
    setSelections((s) => ({ ...s, [id]: value }));
  }, []);

  const resetSelections = React.useCallback(() => {
    setSelections(defaultsFromSchema(manifest?.config));
  }, [manifest]);

  return (
    <FeatureCtx.Provider
      value={{
        manifest, setManifest,
        activeTab, setActiveTab,
        rightOpen, setRightOpen,
        previewView, setPreviewView,
        previewOrientation, setPreviewOrientation, togglePreviewOrientation,
        previewZoom, setPreviewZoom,
        selections, setSelection, resetSelections,
      }}
    >
      {children}
    </FeatureCtx.Provider>
  );
}

export function useFeatureContext(): Ctx {
  const c = React.useContext(FeatureCtx);
  if (!c) throw new Error("useFeatureContext must be inside <FeatureProvider>");
  return c;
}

/** Page registers its manifest. Pass a memoized manifest object. */
export function useFeatureManifest(m: FeatureManifest | null) {
  const ctx = React.useContext(FeatureCtx);
  React.useEffect(() => {
    if (!ctx) return;
    ctx.setManifest(m);
    return () => ctx.setManifest(null);
  }, [ctx, m]);
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

/** Encode selections into a URL query string. Booleans → 1/0; arrays → csv. */
export function selectionsToQuery(s: Selections): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(s)) {
    if (v == null) continue;
    if (typeof v === "boolean") parts.push(`${k}=${v ? "1" : "0"}`);
    else if (Array.isArray(v)) {
      if (v.length) parts.push(`${k}=${encodeURIComponent(v.join(","))}`);
    } else if (v) parts.push(`${k}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? "?" + parts.join("&") : "";
}

/** Build a github source URL from a repo manifest. */
export function repoUrl(src: NonNullable<FeatureManifest["sourceRepo"]>): string {
  const branch = src.branch ?? "main";
  return `https://github.com/${src.owner}/${src.repo}/tree/${branch}/${src.path}`;
}
