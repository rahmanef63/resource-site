// Shared types for the Bundle Builder UI.

export type BuildMode = "new" | "existing";

export type BuildSelection = {
  /** Selected template slug (e.g. "personal-brand-os"). null = none picked. */
  template: string | null;
  /** Selected feature slugs. */
  features: string[];
  /** Selected Claude skill slugs. */
  skills: string[];
  /** Project form fields — only used in "new" mode. */
  project: ProjectForm;
};

export type ProjectForm = {
  appName: string;
  brandName: string;
  ownerEmail: string;
};

export const EMPTY_SELECTION: BuildSelection = {
  template: null,
  features: [],
  skills: [],
  project: { appName: "my-app", brandName: "", ownerEmail: "" },
};
