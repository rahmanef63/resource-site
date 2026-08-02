"use client";

import * as React from "react";
import { Code2, Columns2, Eye, LayoutDashboard, Wand2 } from "lucide-react";
import { PreviewPane } from "@/components/site/preview-pane";
import { SplitPreviewPane } from "@/components/site/split-preview-pane";
import type {
  FeatureManifest,
  FeatureTab,
} from "@/components/site/feature-context";
import type { PreviewView } from "@/lib/preview-presets";

export interface BuildPreviewManifestArgs {
  /** Stable identity per page (usually the slug). Used by the
   *  FeatureProvider to decide whether a manifest update represents a
   *  fresh page (reset tab/view/zoom) or a same-page re-render
   *  (preserve user state). Always pass this — falls back to title. */
  id?: string;
  title: string;
  subtitle?: string;

  /** Preview surfaces. Tabs render conditionally on what's provided. */
  publicPath?: string;
  adminPath?: string;
  /** BR-wave — optional canonical external URLs for "Open in new tab"
   *  buttons inside the SplitPreviewPane toolbar. Iframes still load
   *  publicPath/adminPath so same-origin localStorage stays in sync
   *  between public + admin panes; only the new-tab destinations
   *  change. Pass `https://demo-<short>.rahmanef.com/` here. */
  publicExternalUrl?: string;
  adminExternalUrl?: string;
  /** Which surface tab opens first ("public" | "admin"). Default "public". */
  defaultSurface?: "public" | "admin";
  /** Initial viewport preset for the iframe. */
  defaultView?: PreviewView;
  /** Initial zoom for the iframe (0–1). */
  defaultZoom?: number;
  /** Key for SplitPreviewPane persistence. Defaults to publicPath. */
  splitStorageKey?: string;

  /** Render fn for the Code tab. Tab is added when present. */
  code?: () => React.ReactNode;
  /** Render fn for the Prompt tab. Tab is added when present. */
  prompt?: () => React.ReactNode;

  /** Extra tabs appended after Code + Prompt. */
  extras?: FeatureTab[];

  /** Optional inspector + assembler bits (passed through). */
  inspector?: FeatureManifest["inspector"];
  sourceRepo?: FeatureManifest["sourceRepo"];
  config?: FeatureManifest["config"];
  composePrompt?: FeatureManifest["composePrompt"];
  composePreviewSrc?: FeatureManifest["composePreviewSrc"];

  /** Override the auto-picked default tab. */
  defaultTab?: string;
}

/**
 * SSOT for the docs-shell preview tab strip. Used by both /slices/[slug]
 * and /layouts/[slug] so they expose the same Code / Public / Split /
 * Admin / Prompt experience regardless of entity type.
 *
 * Tabs are conditional:
 *   • Public  — when publicPath set
 *   • Split   — when both publicPath and adminPath set
 *   • Admin   — when adminPath set
 *   • Code    — when code render fn passed
 *   • Prompt  — when prompt render fn passed
 *   • …extras — appended last
 *
 * defaultTab picks the first available surface that matches
 * defaultSurface, falling back to public → admin → code → first extra.
 */
export function buildPreviewManifest(args: BuildPreviewManifestArgs): FeatureManifest {
  const tabs: FeatureTab[] = [];

  const dual = Boolean(args.publicPath && args.adminPath);
  const splitKey = args.splitStorageKey ?? args.publicPath ?? args.adminPath ?? args.title;

  if (args.publicPath) {
    tabs.push({
      id: "preview-public",
      label: "Public",
      icon: Eye,
      render: () => <PreviewPane src={args.publicPath!} />,
    });
  }
  if (dual) {
    tabs.push({
      id: "preview-split",
      label: "Split",
      icon: Columns2,
      render: () => (
        <SplitPreviewPane
          publicSrc={args.publicPath!}
          adminSrc={args.adminPath!}
          publicExternalUrl={args.publicExternalUrl}
          adminExternalUrl={args.adminExternalUrl}
          storageKey={splitKey}
        />
      ),
    });
  }
  if (args.adminPath) {
    tabs.push({
      id: "preview-admin",
      label: "Admin",
      icon: LayoutDashboard,
      render: () => <PreviewPane src={args.adminPath!} />,
    });
  }
  if (args.code) {
    tabs.push({
      id: "code",
      label: "Code",
      icon: Code2,
      render: args.code,
    });
  }
  if (args.prompt) {
    tabs.push({
      id: "prompt",
      label: "Prompt",
      icon: Wand2,
      render: args.prompt,
    });
  }
  if (args.extras) tabs.push(...args.extras);

  const defaultTab =
    args.defaultTab ??
    (args.defaultSurface === "admin" && args.adminPath
      ? "preview-admin"
      : args.publicPath
        ? "preview-public"
        : args.adminPath
          ? "preview-admin"
          : args.code
            ? "code"
            : (tabs[0]?.id ?? undefined));

  return {
    id: args.id ?? args.title,
    title: args.title,
    subtitle: args.subtitle,
    tabs,
    defaultTab,
    previewUrls: {
      public: args.publicPath,
      admin: args.adminPath,
    },
    responsive: Boolean(args.publicPath || args.adminPath),
    defaultView: args.defaultView,
    defaultZoom: args.defaultZoom,
    sourceRepo: args.sourceRepo,
    inspector: args.inspector,
    config: args.config,
    composePrompt: args.composePrompt,
    composePreviewSrc: args.composePreviewSrc,
  };
}
