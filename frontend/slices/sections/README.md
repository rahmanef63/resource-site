# landing-sections

Admin-editable composition of your public landing page. Ships a generic
CRUD shell (list + per-row edit dialog + full-page editor) + a pure
reducer + a per-section wrapper that applies admin-managed background
images and custom Tailwind tweaks — without forcing any particular
public renderer on you.

Canonical pattern: every rr website template uses this exact slice to
let operators compose `/` from the admin without redeploying.

## Install

```bash
npx rr add landing-sections
```

CLI copies the slice into `slices/landing-sections/` in your consumer
project. You own the files — tweak away.

## Surface

| Export | Kind | Notes |
|---|---|---|
| `LandingView` | component | Admin list — sorted by `order`, row click → edit dialog, up/down reorder arrows, visible-on-`/` toggle. |
| `LandingEditorView` | component | Full-page editor for a single section. Props: `{ id }`. |
| `LandingSectionShell` | component | Wraps every public renderer; applies `bgImageUrl` + `section.className`. Props: `{ section, defaultClassName?, children }`. |
| `LandingProvider` | context provider | Wrap your StoreProvider with `<LandingProvider value={adapter}/>`. |
| `useLandingStore` | hook | Reads the adapter; admin views call this internally. |
| `landingReducer` | reducer | Pure reducer for `LANDING_UPSERT` / `LANDING_DELETE`. |
| `defaultLandingSections()` | factory | Seed array (5 sections) for first run. |
| `blankSection(lastOrder)` | factory | New-row template (used by the editor). |
| `LANDING_FIELDS` | schema | `FieldDef<LandingSection>[]` — shared list-dialog + full-page editor schema. |
| `LandingSection`, `LandingSectionKind`, `LandingAction`, `LandingSlice` | types | Use to type your reducer + store. |

## Wiring (consumer)

The slice intentionally has zero opinion about how your sections
render publicly. You wire it up in four steps:

### 1. Fold `landingReducer` into your root reducer

```ts
import { landingReducer, type LandingSlice, type LandingAction } from "@/features/sections";

type State = LandingSlice & { /* …your other slices */ };
type Action = LandingAction | /* …your other actions */;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LANDING_UPSERT":
    case "LANDING_DELETE":
      return { ...state, ...landingReducer(state, action) };
    /* …other cases */
    default:
      return state;
  }
}
```

### 2. Seed `landingSections` in initial State

```ts
import { defaultLandingSections } from "@/features/sections";

const initialState: State = {
  landingSections: defaultLandingSections(),
  // …rest
};
```

### 3. Wrap your StoreProvider with `<LandingProvider>`

```tsx
import { LandingProvider, type LandingStore } from "@/features/sections";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useStore();
  const adapter: LandingStore = {
    items: state.landingSections,
    publicBase: "/",
    adminBase: "/admin",
    create: (section) => dispatch({ type: "LANDING_UPSERT", payload: section }),
    update: (id, patch) => {
      const existing = state.landingSections.find((s) => s.id === id);
      if (!existing) return;
      dispatch({ type: "LANDING_UPSERT", payload: { ...existing, ...patch } });
    },
    remove: (id) => dispatch({ type: "LANDING_DELETE", payload: { id } }),
  };
  return <LandingProvider value={adapter}>{children}</LandingProvider>;
}
```

### 4. Mount admin routes

```tsx
// app/admin/landing/page.tsx
import { LandingView } from "@/features/sections";
export default function Page() { return <LandingView />; }

// app/admin/landing/[id]/page.tsx
import { LandingEditorView } from "@/features/sections";
export default function Page({ params }: { params: { id: string } }) {
  return <LandingEditorView id={params.id} />;
}
```

### 5. Public renderer (per-template)

In your `HomePage`, iterate enabled sections in order and dispatch to
your own per-template renderer. Wrap each section in
`<LandingSectionShell>` so admin-edited `bgImageUrl` + `className`
overlays apply uniformly.

```tsx
import { LandingSectionShell, useStore } from "…";

export function HomePage() {
  const { state } = useStore();
  const sections = state.landingSections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
  return (
    <>
      {sections.map((s) => (
        <LandingSectionShell key={s.id} section={s}>
          <YourRenderer section={s} />
        </LandingSectionShell>
      ))}
    </>
  );
}
```

Inside `YourRenderer`, branch on `section.kind` and render the
appropriate component. Pass `section.imageUrl`, `section.imageRatio`,
`section.title`, `section.subtitle`, and `JSON.parse(section.config ?? "{}")`
to feed your hero / features / pricing / etc. components.

## `kind` → recommended renderer

| `kind` | What it should render |
|---|---|
| `hero` | Headline + subtitle + foreground image (use `imageRatio`); honor `config.badge` for eyebrow override. |
| `features` | 3-6 item grid. `config.columns` may override default. Pair with the `feature-grid` slice. |
| `pricing` | Tier table. Pair with the `pricing-page` slice; tiers come from your own store. |
| `blog` | Recent posts grid. `config.limit` caps count. Pair with `blog-section`. |
| `changelog` | Recent changelog entries. `config.limit` caps count. |
| `testimonials` | Quote cards. Pair with `testimonials-grid`. |
| `portfolio` | Case-study grid. Pair with `portfolio-section`. `config.columns` may apply. |
| `services` | Service band — typically `feature-grid` with `layout="alternating"`. |
| `stats` | Numeric KPIs strip. |
| `newsletter` | Email signup form. |
| `faq` | Accordion. Pair with `faq-section`. |
| `cta` | Single-action band — headline + button. |
| `custom` | Escape hatch — render anything; lean on `section.config` JSON for free-form props. |

## CRUD dialog UX

The admin list (LandingView) inherits row-click → edit dialog behavior
from the `@/components/templates/_shared/crud` layer. That CRUD shell
is a **sibling dependency** — it must already be installed in your
consumer (every rr website template ships it). The slice does NOT bundle
it. If you're starting from a non-rr template, install it manually before
this slice (it's the same `CrudListView` + `CrudFormView` used by every
other admin entity).

## Dependencies

- npm: `lucide-react` (icons in CRUD), `next` (peer)
- shadcn primitives: `badge`, `button`, `dialog`, `input`, `label`,
  `select`, `switch`, `table`, `textarea`
- consumer-side peer: `@/components/templates/_shared/crud/*`
  (`CrudListView`, `CrudFormView`, `types`)
- consumer-side peer: `@/lib/utils` (`cn` helper — shipped by default
  in the shadcn-init scaffold)

## Notes

- No Convex tables — state lives in your existing store. Persistence
  is consumer's call (localStorage, Convex, anything).
- Field schema (`LANDING_FIELDS`) is shared between the list-dialog
  editor and the full-page editor — single source of truth.
- Up/down reorder swaps `order` values pairwise; you don't need to
  re-number the whole list.
- `bgImageUrl` falls back to soft gradient scrim for readability;
  `LandingSectionShell` handles broken-image hiding via `onError`.
