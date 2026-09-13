// React-facing contracts for site-setup-wizard. Portable field/preset/state
// semantics live in ./core so React and Svelte consume one SSOT.

import type * as React from "react";

export {
  normalizePresetOptions,
  type OnboardingFields,
  type PresetOption,
} from "./core";

/** Image upload control injected into the React wizard. The Svelte
 * distribution exposes an equivalent render snippet instead of importing
 * React types into the shared core. */
export type ImageFieldComponent = React.ComponentType<{
  label: string;
  onUploaded: (url: string) => void;
}>;
