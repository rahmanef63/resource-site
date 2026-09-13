"use client";

// React/appshelly host seam. Portable adapter/data/sandbox behavior lives in
// lib/core.ts so native framework distributions consume one SSOT.
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  configureHtmlStudio,
  htmlStudioApi,
  type HtmlDoc,
  type HtmlStudioAdapter,
  type PageRow,
  type SavedPage,
  type Visibility,
} from "./core";

export type InspectorInfo = {
  subject?: string;
  props?: { label: string; value: string }[];
  actions?: { id: string; label: string; run: () => void }[];
  context?: string;
  suggestions?: string[];
};
export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

export type AppProps = { payload?: unknown };
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType<AppProps> }>;
  defaultSize?: { w: number; h: number };
};

export { configureHtmlStudio };
export type { HtmlDoc, HtmlStudioAdapter, PageRow, SavedPage, Visibility };

/** Backward-compatible React seam; the API itself is framework-neutral. */
export function useHtmlStudioApi(): typeof htmlStudioApi {
  return htmlStudioApi;
}
