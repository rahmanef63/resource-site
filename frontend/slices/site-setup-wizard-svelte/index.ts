export { default as OnboardingWizard } from "./components/OnboardingWizard.svelte";
export { default as StepIdentity } from "./components/StepIdentity.svelte";
export { default as StepBranding } from "./components/StepBranding.svelte";
export { default as StepContent } from "./components/StepContent.svelte";
export { default as StepDone } from "./components/StepDone.svelte";
export { default as ThemePresetField } from "./components/ThemePresetField.svelte";
export { default as Field } from "./components/Field.svelte";
export { siteSetupWizardConfig, type SiteSetupWizardConfig } from "./config";
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
} from "../site-setup-wizard/lib/core";
export { onboardingWizardTools, type OnboardingWizardCtx } from "../site-setup-wizard/lib/tools";
