# Site Setup Wizard — Svelte 5 / SvelteKit

Native Svelte first-run onboarding UI over the same framework-neutral wizard
core and agent tools used by the default React/Next distribution.

```bash
npx rr add site-setup-wizard --framework sveltekit
```

`OnboardingWizard` keeps the Identitas → Branding → Konten → Selesai flow,
skip/save semantics, optional seed callback, theme preset preview, brand color
and mode controls, analytics field, and an optional `imageField` snippet for
host-owned logo/favicon upload UI. Backend writes remain injected through
`save`; no Convex backend is invented by this slice.
