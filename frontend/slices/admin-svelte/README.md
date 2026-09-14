# Admin — SvelteKit

Native Svelte 5 distribution for the `admin` slice. React/Next remains the default.

- `npx rr add admin --framework sveltekit` installs both variants.
- `npx rr add admin shell --framework sveltekit` installs the generic shell plus `convex/features/admin` only.
- `npx rr add admin console --framework sveltekit` installs the composed console plus `convex/features/admin_console` only.

The console reuses the same access rules and 26-section registry as React. Peer/provider panels are injected as Svelte snippets; no React provider is imported into the Svelte renderer.
