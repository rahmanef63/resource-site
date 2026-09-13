# Changelog — site-setup-wizard

## 0.3.0 — 2026-09-13

- Extracted a framework-neutral onboarding core for bounded steps, fields, preset normalize/group, optional-email validation, seeded state, and final save payload; React is now an adapter over that core.
- Added native Svelte 5/SvelteKit wizard UI with identity, branding, preset live-preview, optional image-upload snippet, seed-content and completion flow over the same core + agent tools.
- Removed the duplicate theme-presets-coupled public playground in favor of canonical `preview.tsx`; fixed default React catalog dependency drift for `lucide-react@^0.400.0`.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `onboardingWizardTools` — status/goto_step/set_field/complete over injectable `OnboardingWizardCtx` (wizard state stays parent-owned).
