# Site Setup Wizard

First-run onboarding for clone-to-own sites. React/Next remains the default
rendering distribution; Svelte 5/SvelteKit is additive. Both use one portable
wizard core for step bounds, field state, preset normalization/grouping, email
validation, seeded state, and final save payload semantics.

## Install

```bash
npx rr add site-setup-wizard
npx rr add site-setup-wizard --framework sveltekit
```

The host owns persistence and integrations: `save`, optional `seedSample`,
optional logo/favicon upload UI, and optional theme-preset live preview. The
slice does not invent a backend.

The flow remains **Identitas → Branding → Konten → Selesai**. `Lewati setup`
restores an uncommitted theme preview and saves only `{ markOnboarded: true }`.
Finishing strips empty string fields before calling `save`.

See `HOST-SETUP.md` for the React host wiring. The Svelte distribution exposes
an `imageField` snippet for host-owned upload UI and otherwise preserves the
same callback boundary.
