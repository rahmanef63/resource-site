/** site-setup-wizard — first-run site setup for clone-to-own templates. */

export { OnboardingWizard } from "./components/OnboardingWizard";
export { StepIdentity, StepContent, StepDone, Field } from "./components/steps";
export { StepBranding } from "./components/step-branding";
export { ThemePresetField } from "./components/theme-preset-field";
export type { ImageFieldComponent } from "./lib/types";
export {
  ONBOARDING_STEPS,
  buildOnboardingSavePayload,
  createOnboardingFields,
  createOnboardingStore,
  groupPresetOptions,
  isValidOptionalEmail,
  normalizePresetOptions,
  type OnboardingFields,
  type OnboardingSavePayload,
  type OnboardingSnapshot,
  type OnboardingStore,
  type PresetOption,
} from "./lib/core";
export { onboardingWizardTools, type OnboardingWizardCtx } from "./lib/tools";
