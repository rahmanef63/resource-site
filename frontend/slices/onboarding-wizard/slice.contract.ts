/**
 * onboarding-wizard — first-run site setup wizard for clone-to-own templates.
 *
 * Graduated from components/templates/_shared/headless/ (2026-06-06) so
 * consumers can `npx rr add onboarding-wizard`. Props-driven (R3): no
 * convex/react import — host wires settings.upsert / seed.seedSample /
 * setup.status into props. Branding step ships a readable shadcn Select
 * preset picker (replaces the white-on-white native <select>) with color
 * swatches + live preview callback.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "onboarding-wizard",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: [
      "OnboardingWizard",
      "StepIdentity",
      "StepBranding",
      "StepContent",
      "StepDone",
      "ThemePresetField",
      "Field",
    ],
    utils: ["normalizePresetOptions"],
    hooks: [],
    types: ["OnboardingFields", "ImageFieldComponent", "PresetOption"],
  },
  requires: {
    npm: [],
    shadcn: ["button", "card", "input", "label", "progress", "select"],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
