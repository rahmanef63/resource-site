"use client";

// React/appshell adapter. Framework-neutral identity data/configuration lives in
// ../../../lib/core so React and Svelte share one profile singleton.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  configureAbout,
  readAboutProfile,
  type AboutFaq,
  type AboutLink,
  type AboutProfile,
} from "@/features/profile/lib/core";

export type InspectorInfo = {
  subject?: string;
  props?: { label: string; value: string }[];
  actions?: { id: string; label: string; run: () => void }[];
  context?: string;
  suggestions?: string[];
};
export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

export { configureAbout };
export type { AboutProfile, AboutLink, AboutFaq };

export function useAboutProfile(): AboutProfile {
  return readAboutProfile();
}
