# app-store changelog

## 1.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `appStoreTools` exports 4
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(appStoreTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.

## 1.1.0 — 2026-06-10

- Responsive storefront (merged from os-vps): content pane now mounts in a
  slice-local `AppFrame` shim (sticky header, `@container`, safe-area body
  with `--sai-bottom` 0px fallback); below ~600px pane width the category
  rail swaps for a horizontal `StoreFilterChips` row (JS bucket via new
  `lib/use-container.ts`, not CSS-hidden). Sidebar rows wrapped in a
  `TouchList` shim → ≥44px hit targets on coarse pointers. Grids gain
  `@7xl:grid-cols-4`. New files: `components/host-frame.tsx`,
  `lib/use-container.ts`. Barrel/contract surface unchanged.

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside), with the Create-App flow bundled in (rr
  forbids slice→slice imports). localStorage registry + useInstalledApps()
  descriptors; console exec injected via configureAppStoreExec (demo echo
  default); inspector bus inert; slice-local Segmented primitive.
