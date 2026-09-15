# dashboard-shell — SvelteKit

Native Svelte 5 / SvelteKit dashboard chrome over the same portable navigation core as the React default.

```bash
npx rr add dashboard-shell --framework sveltekit
```

## Surface

- `DashboardShell.svelte` — desktop rail + topbar + optional contextual column, plus the mobile surfaces.
- `DashboardSidebar.svelte` — collapsible desktop rail.
- `MobileDock.svelte` — CSS-only mobile dock.
- `MobileMenuDrawer.svelte` — bottom tile drawer with one-level drill-down.
- `isActive`, `deriveDock`, `activeItem`, `activeTitle`, `flattenNav` — shared framework-neutral navigation semantics.

The shell reads `page.url.pathname` from `$app/state` unless `activePath` is supplied. Computed title/dock/path values use `$derived`; lists are keyed; there is no `$effect`.

The Svelte distribution intentionally does not install React, Next, Lucide, Vaul, or shadcn. Item icons/logo are Svelte snippets, while badges stay string/number data.
