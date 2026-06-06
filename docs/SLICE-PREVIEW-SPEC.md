# Slice Preview Spec (VP wave, 2026-06-05)

Slices behave like shadcn primitives: declared **variant props**, a live
**widget preview** per variant fed by localStorage demo data, and a generated
**registry** so the builder (and its AI) discovers previews dynamically — no
hardcode.

## The three pieces

| Piece | File | Owner |
|---|---|---|
| Declaration | `frontend/slices/<slug>/slice.json` → `previews` block | slice author |
| Render | `frontend/slices/<slug>/preview.tsx` (default export) | slice author |
| Registry | `lib/preview/{registry.gen.ts, preview-meta.gen.json}` | **generated** — `npm run gen:previews` |

## Declaration — `previews` in slice.json

```jsonc
"previews": [
  {
    "component": "MarkdownPage",        // public export being demoed
    "kind": "variants",                 // leaf slice → enum prop axes
    "axes": [
      { "prop": "tabs", "values": ["read", "crud"], "default": "read" }
    ],
    "seed": "sample product-review markdown doc"
  },
  {
    "component": "NotionDatabase",
    "kind": "scenarios",                // subsystem slice → curated presets
    "scenarios": [
      { "id": "table", "title": "Table view" },
      { "id": "board", "title": "Board view" }
    ]
  }
]
```

**Opt-out:** `"previews": []` declares "no preview by design" (headless slice,
external embed, no public component seam). `audit:slices` warns when a slice
has `components/` but no `previews` key at all — every slice must declare or
opt out. An opt-out plus a stray `preview.tsx` is a generator error.

**template-base slices:** the generator also scans
`template-base/frontend/slices/*/slice.json`, but the render file lives
SITE-SIDE at `components/templates/_shared/previews/<slug>.preview.tsx` —
template-base ships its own `node_modules` (a second react → hooks crash if a
.tsx resolves from there) and is tsc-excluded. These previews may import only
site-compiled code (`@/components/templates/_shared/*`, `@/components/ui/*`,
`@/shared/preview/*`); slices whose real implementation only exists in
consumer projects (facades over `@/frontend/shared/*`, e.g. motion-primitives)
cannot be previewed honestly — leave them undeclared.

**Smoke gate:** `lib/preview/preview-smoke.test.tsx` mounts every registered
preview with its default variant in happy-dom on `npm test` (pre-push).

Rules (gated by `gen-preview-registry.mjs` + slice-schema):

- **Axes are enum-only, max 3 per component.** Values are opaque strings —
  `preview.tsx` maps them to real props. This keeps the AI tool schema small
  and makes every AI-requested variant valid by construction.
- **Altitude rule** (docs/SLICE-REUSABILITY-PLAN.md): leaf UI slices get
  `variants`; subsystem slices (notion-database, doku-payment, …) get
  `scenarios` — curated presets, never a full prop matrix.
- `default` must be one of `values`.

## Render — preview.tsx

```tsx
"use client";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { MarkdownPage } from "./index";

const { useDemoStore } = createDemoStore({ slug: "markdown", seed: SEED_MD });

const preview: SlicePreviewModule = {
  MarkdownPage: ({ variant }) => {
    const [doc, setDoc, { ready, reset }] = useDemoStore();
    if (!ready) return null; // builder shows its own skeleton
    return (
      <MarkdownPage
        content={doc}
        onContentChange={setDoc}
        tabs={variant.tabs === "crud" ? ["read", "write", "review"] : ["read"]}
      />
    );
  },
};
export default preview;
```

- Component receives `{ variant }` — axis prop → selected value string
  (`variants`), or `{ scenario: "<id>" }` (`scenarios`).
- Demo data: `createDemoStore` (`@/shared/preview/demo-store`) — localStorage
  `rr-demo:<slug>:v<n>`, seed-on-first-mount, write-through, `reset()`.
  Client-only; the builder mounts previews with `ssr: false`. The VPS serves a
  static chunk and computes nothing.
- Allowed imports: `@/shared/preview/*`, own slice (`./index`,
  `@/features/<own-slug>/*`), `@/components/ui/*` — same audit:slices gate as
  any slice file. 200-LOC cap applies.
- **preview.tsx is rr-internal.** It is NOT listed in slice.manifest.json
  `files` and `rr add` strips it after pull (consumers don't have
  `@/shared/preview/*`).

## Registry — generated, never hand-edited

`npm run gen:previews` scans slices and emits:

- `lib/preview/registry.gen.ts` — `PREVIEW_REGISTRY: { [slug]: () => import("@/features/<slug>/preview") }`.
  One dynamic import per slug → one code-split chunk per preview.
- `lib/preview/preview-meta.gen.json` — declared metadata (component, kind,
  axes, scenarios, seed note + slice title/category). Server-safe JSON: the
  builder's knobs UI and the AI tool factory both read this — slices are
  fetched dynamically, never hardcoded.

`npm run gen:previews:check` is the CI drift guard (same pattern as
sync-skills). Consistency gates: previews-block ⇄ preview.tsx must both exist;
`variants` needs `axes`; `scenarios` needs `scenarios`; ≤3 axes.

## Builder + AI consumption

- `<VariantPreview slug>` (builder): `next/dynamic(PREVIEW_REGISTRY[slug], { ssr:false })`,
  knobs auto-generated from meta axes, preload on hover.
- AI function-calling: tool defs are built at request time from
  preview-meta.gen.json + manifest.json — `list_slices`, `get_slice`,
  `preview_slice({ slug, component, variant })`, `compose_bundle`. Axis enums
  embed directly in the tool's JSON schema, so the model can only request
  variants that exist.
