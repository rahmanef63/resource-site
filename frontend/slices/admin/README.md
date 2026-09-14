# Admin

Framework-parity access-gated admin surfaces behind one slug. React/Next remains the default; Svelte 5/SvelteKit is explicit.

```bash
npx rr add admin shell
npx rr add admin console
npx rr add admin

npx rr add admin shell --framework sveltekit
npx rr add admin console --framework sveltekit
npx rr add admin --framework sveltekit
```

`admin@0.4.0` keeps the same two variants and backend boundaries:

- **shell** — generic `AdminPage` + portable `buildAdminStats()` over `convex/features/admin`; only `SUPER_ADMIN_EMAIL` is relevant.
- **console** — access-gated 26-section console over `convex/features/admin_console`; only `PLATFORM_ADMIN_EMAILS` is relevant. Five sections are owned here (analytics, audit log, nav config, SEO health, leads); provider sections are host-composed.

React composes provider panels through its `components` map. Svelte composes them through a `panels` map of Svelte snippets. Both renderers reuse the same access rules, section catalog, mock contracts, section URL semantics, registry stats core, and Convex backends.
