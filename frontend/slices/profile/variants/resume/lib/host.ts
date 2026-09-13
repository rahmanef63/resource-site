"use client";

// React/appshell adapter. Framework-neutral profile data/configuration lives in
// ../../../lib/core so React and Svelte share one profile singleton.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  configureResume,
  readResumeProfile,
  type ResumeContact,
  type ResumeExperience,
  type ResumeProfile,
  type ResumeProject,
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

export { configureResume };
export type { ResumeProfile, ResumeContact, ResumeExperience, ResumeProject };

export function useResumeProfile(): ResumeProfile {
  return readResumeProfile();
}
