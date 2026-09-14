# sections

Canonical admin-editable composition for a public landing page. React/Next is the default distribution; explicit SvelteKit installs native Svelte 5 admin and public renderers over the same framework-neutral core.

## Install

```bash
npx rr add sections
npx rr add sections --framework sveltekit
```

## Shared contract

Both renderers use the same:

- `LandingSection` / `LandingSectionKind` types.
- `LandingStore` adapter (`items`, `publicBase`, `adminBase`, `create`, `update`, `remove`).
- `landingReducer` with collision-free order shifting.
- `blankSection`, kind labels/options, reorder helpers, and visibility summary.
- `LANDING_FIELDS_CORE` editor schema.
- Config parser used by stats, testimonials, FAQ, pricing, newsletter, and custom sections.

No Convex table is required; persistence belongs to the host store.

## React / Next

```tsx
import { LandingProvider, LandingView, type LandingStore } from "@/features/sections";

const adapter: LandingStore = {
  items: state.landingSections,
  publicBase: "/",
  adminBase: "/admin",
  create: (section) => dispatch({ type: "LANDING_UPSERT", payload: section }),
  update: (id, patch) => {
    const current = state.landingSections.find((item) => item.id === id);
    if (current) dispatch({ type: "LANDING_UPSERT", payload: { ...current, ...patch } });
  },
  remove: (id) => dispatch({ type: "LANDING_DELETE", payload: { id } }),
};

<LandingProvider value={adapter}>
  <LandingView />
</LandingProvider>
```

The React distribution is now self-contained apart from declared npm/shadcn primitives. It no longer requires the repo-internal `templates/_shared` CRUD/motion layer and no longer requires `next` for CTA links.

## Svelte 5 / SvelteKit

```svelte
<script lang="ts">
  import { LandingProvider, LandingView } from "@/features/sections";
  let store = $state(adapter);
</script>

<LandingProvider value={store}>
  <LandingView />
</LandingProvider>
```

You may also pass `store={adapter}` directly to `LandingView` or `LandingEditorView`. The Svelte distribution depends only on `svelte@^5`; it imports no React, Next, Lucide React, Embla, shadcn, or template-shared runtime.

## Public renderers

Exports in both frameworks:

- `LandingSectionShell`
- `StatsSection`
- `TestimonialsSection`
- `FaqSection`
- `PricingSection`
- `NewsletterSection`
- `CustomSection`

Each renderer reads `section.config` using the same safe config parser and falls back to props supplied by the host template.

## Reducer wiring

```ts
import { landingReducer, defaultLandingSections } from "@/features/sections";

const state = { landingSections: defaultLandingSections() };
const next = landingReducer(state, {
  type: "LANDING_UPSERT",
  payload: { ...state.landingSections[0], order: 2 },
});
```

`LANDING_UPSERT` automatically shifts sibling orders; `LANDING_DELETE` closes the remaining gap.

## React dependencies

- npm: `lucide-react`, `embla-carousel-autoplay`
- shadcn: `accordion`, `badge`, `button`, `card`, `carousel`, `dialog`, `input`, `switch`, `table`, `textarea`

## Notes

- `bgImageUrl` and `className` are applied by `LandingSectionShell`.
- Newsletter persistence is opt-in via `onSubscribe`; without it the renderer is local-only.
- The canonical CLI slug and source path are both `sections` / `frontend/slices/sections`.
