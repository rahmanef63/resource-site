// Shared types for the Bundle Builder UI.

import type { PublicFrameworkId, PublicPackageManager } from "@/lib/content/framework-matrix";

export type BuildMode = "new" | "existing";

export type BuildSelection = {
  /** Selected template slug (e.g. "personal-brand-os"). null = none picked. */
  template: string | null;
  /** Selected feature slugs. */
  features: string[];
  /** Selected tier-3 slice slugs. */
  slices: string[];
  /** Selected Claude skill slugs. */
  skills: string[];
  /** Project form fields — only used in "new" mode. */
  project: ProjectForm;
};

export type ProjectForm = {
  appName: string;
  brandName: string;
  ownerEmail: string;
  framework: PublicFrameworkId;
  packageManager: PublicPackageManager;
};

export const EMPTY_SELECTION: BuildSelection = {
  template: null,
  features: [],
  slices: [],
  skills: [],
  project: { appName: "my-app", brandName: "", ownerEmail: "", framework: "react-next", packageManager: "npm" },
};
