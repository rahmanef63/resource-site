# Ideal Structure — Rahman Resources Kitab

> Status: Draft v1 — 2026-05-12
> Owner: kitab maintainers
> Replaces piecemeal layout from `docs/architecture.md` + `docs/slice-architecture.md`.
> See `docs/REFACTOR-PLAN.md` for migration path from current state.

This doc = **target** structure, not current state. Current state diverges; tracker in REFACTOR-PLAN.

## North star

One repo, four concerns, zero overlap:

| Concern | Home | Owner |
|---|---|---|
| **Site** — public docs + bundle builder UI | `app/` + `components/site/` + `components/build/` | resource.rahmanef.com |
| **Delivery** — installer + agent surface | `packages/cli/` + `packages/mcp/` | npm + Claude |
| **Template base** — consumer's starting app skeleton | `template-base/` | tiged pull target |
| **Kitab content** — portable code units + their docs | `frontend/slices/` + `convex/features/` + `cookbook/` + `lib/content/` | the kitab itself |

Each concern owns its files. Cross-references go through `lib/content/*.ts` (SSOT) → `packages/cli/lib/manifest.json` (generated).

## Canonical tree

```
resources/
├── app/                                 # Next.js site routes
│   ├── (docs)/                          # docs surface (templates, layouts, slices, recipes)
│   │   ├── templates/[slug]/page.tsx
│   │   ├── layouts/[slug]/page.tsx
│   │   ├── slices/[slug]/page.tsx
│   │   └── recipes/[slug]/page.tsx
│   ├── (marketing)/                     # landing, /llms.txt, /api/knowledge
│   ├── build/                           # bundle builder UI
│   └── preview/                         # iframed preview pages
│       ├── <template-slug>/page.tsx     # full template preview (full-width, no chrome)
│       └── slices/<slug>/page.tsx       # slice preview (full-width, no chrome)
│
├── components/                          # site UI only — NOT kitab content
│   ├── site/                            # docs shell, sidebars, navbar
│   ├── build/                           # bundle builder UI bits
│   ├── admin/                           # admin docs preview shell
│   └── ui/                              # shadcn primitives
│
├── frontend/                            # KITAB CONTENT — portable slices live here
│   └── slices/<slug>/                   # ★ single canonical home for slice source
│       ├── slice.json                   # contract (slug, version, deps, paths)
│       ├── config.ts                    # defineFeature() metadata
│       ├── index.ts                     # public barrel
│       ├── page.tsx                     # optional — slice route entry
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── views/                       # optional — page-level compositions
│       └── README.md
│
├── convex/                              # KITAB CONTENT — backend code drops
│   └── features/<slug>/                 # mirrors frontend slice when kind=full|backend
│       ├── schema.ts
│       ├── queries.ts
│       ├── mutations.ts
│       ├── actions/
│       ├── http.ts                      # optional — webhook handlers
│       └── lib/
│
├── cookbook/                            # KITAB CONTENT — layout variants (tier-2 building blocks)
│   └── layouts/<slug>/                  # one folder per layout, drop-in
│
├── lib/                                 # site code only — does NOT ship to consumers
│   ├── content/                         # ★ SSOT — drives manifest generation
│   │   ├── templates.ts                 # tier-2 full apps
│   │   ├── layouts.ts                   # tier-2 layout variants
│   │   ├── slices.ts                    # tier-3 portable code units
│   │   ├── claude-skills.ts             # skill registry for MCP
│   │   ├── package-versions.ts          # canonical npm versions
│   │   ├── sources.ts                   # provenance: where each artifact came from
│   │   └── site.ts                      # site metadata
│   ├── preview-presets.ts               # device viewport presets
│   ├── agent-prompt.ts                  # "install with agent" builder
│   └── utils.ts                         # cn() + helpers
│
├── template-base/                       # CONSUMER STARTING POINT — tiged on `rr init`
│   ├── app/                             # minimal app shell, providers, layout
│   ├── frontend/
│   │   ├── shared/                      # foundation: lib, ui, theme, motion, settings
│   │   └── slices/                      # EMPTY by default — slices added by `rr add`
│   ├── convex/                          # minimal: auth, schema, _generated stubs
│   ├── components/ui/                   # shadcn primitives
│   ├── lib/utils.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── AGENTS.md
│
├── packages/
│   ├── cli/                             # `rahman-resources`
│   │   ├── bin/cli.js
│   │   ├── lib/
│   │   │   ├── manifest.json            # ← generated from lib/content/*.ts
│   │   │   └── starter/                 # minimal starter (Tier-1)
│   │   ├── scripts/
│   │   │   ├── gen-manifest.mjs         # SSOT → manifest
│   │   │   ├── parse-content.mjs        # TS reader
│   │   │   ├── validate.mjs             # manifest validators
│   │   │   ├── validate-slice.mjs       # slice.json validators
│   │   │   └── sync-skills.mjs          # claude-skills sync
│   │   └── README.md
│   └── mcp/                             # `rahman-resources-mcp`
│       ├── bin/server.mjs
│       └── src/
│
├── docs/                                # the kitab itself
│   ├── STRUCTURE.md                     # ← this file
│   ├── REFACTOR-PLAN.md                 # migration tracker
│   ├── PROGRESS.md                      # rolling status
│   ├── authoring-slices.md              # how to write a slice
│   ├── source-map.md                    # provenance (where things came from)
│   ├── deploy.md
│   ├── theme-system.md
│   └── templates/                       # per-template playbook
│
├── CLAUDE.md                            # AI session onboarding
├── README.md                            # human onboarding
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## Hard rules

### R1 — One home per concern

| Concern | Home | Forbidden elsewhere |
|---|---|---|
| Slice source code | `frontend/slices/<slug>/` | NOT `template-base/frontend/slices/` (must be empty) |
| Slice backend code | `convex/features/<slug>/` | NOT `template-base/convex/features/<slug>/` |
| Shared UI / utils ship-to-consumer | `template-base/frontend/shared/` | NOT root `frontend/shared/` |
| Site-only UI | `components/site/` | NOT mixed into kitab slices |
| Slice metadata | `lib/content/slices.ts` SSOT | NOT scattered across template-base |
| Compat rules (X requires Y, X forbids Z) | inside each slice's `config.ts` | NOT `lib/build/compat.ts` (delete it) |

Rationale: dual-home = path resolution roulette. Pick one.

### R2 — Three taxonomies max

| Taxonomy | What | When to add |
|---|---|---|
| `templates` | Tier-2 full app variant (personal-brand-os, konsultan-os) | New end-to-end scaffold |
| `layouts` | Tier-2 layout shell (dashboard-three-column, landing-bento) | New visual chrome variant |
| `slices` | Tier-3 portable code unit, `kind: ui \| backend \| full` | New atomic capability |

**Deprecated**: `recipes` — collapse into `slices` with `kind: ui` + tiny scope. Keep `lib/content/recipes.ts` only for legacy entries until migrated; no new recipes.

**No duplicate slugs** across taxonomies. `gen-manifest.mjs` enforces strict uniqueness (remove feature↔slice exemption once recipes migrated).

### R3 — One preview component

`components/site/preview-frame.tsx` = ONLY iframe-shell preview component.

- Accepts optional `controller` prop for context-driven state (replaces `PreviewPane` + `feature-context` coupling).
- `SegmentedFrame` defined once, exported, reused.
- Bundle builder + slice docs + template docs ALL use this.
- Delete `components/site/preview-pane.tsx` after migration.

Preview pages at `app/preview/**` = full-width, no chrome. No `SlicePreviewLayout` headers. Iframe shell already provides chrome.

### R4 — Slice contract is single source

Every slice's `slice.json` declares:

```jsonc
{
  "slug": "doku-payment",
  "version": "0.2.0",
  "kind": "full",
  "title": "DOKU Payment Gateway",
  "description": "...",
  "installPaths": {
    "frontend": "frontend/slices/doku-payment",
    "convex": "convex/features/payment"
  },
  "deps": {
    "npm": ["crypto-js@^4.2.0"],
    "shadcn": ["card", "button", "input"],
    "peers": ["@convex-dev/auth"],
    "env": ["DOKU_CLIENT_ID", "DOKU_SECRET_KEY"]
  },
  "compat": {
    "requires": [],
    "forbids": ["midtrans-payment", "stripe-payment"]
  },
  "previewPath": "/preview/slices/doku-payment"
}
```

`lib/content/slices.ts` SHOULD derive from `slice.json` (parsed at build), not duplicate. Single source. Eliminates `SliceEntry` overload.

### R5 — Generated artifacts never hand-edited

- `packages/cli/lib/manifest.json` — regenerate via `npm run gen` in `packages/cli/`
- `template-base/convex/_generated/` — overwritten by `npx convex dev`
- `frontend/shared/lib/features/registry.ts` — generated from slice configs

All marked with `// @generated` header.

### R6 — Path aliases canonical

| Alias | Resolves to | Where it applies |
|---|---|---|
| `@/*` | repo root | site (resources main) |
| `@/*` | template-base root | consumer projects after `rr init` |
| `@/lib/utils` | `lib/utils.ts` | both — canonical cn() location |
| `@/frontend/shared/*` | `frontend/shared/*` in template-base | consumer only |
| `@/components/ui/*` | shadcn primitives | both |

Slice source code uses `@/*` aliases that resolve in consumer context (template-base layout). Resources site re-uses same alias by mapping to its own root.

### R7 — Docs colocate with code

- Slice usage docs → `frontend/slices/<slug>/README.md`
- Site-wide architecture → `docs/`
- Per-template playbook → `docs/templates/T<N>-<slug>.md`
- API surface → JSDoc in the source

`docs/` does NOT explain individual slices. It explains the system.

## Slice anatomy (detail)

```
frontend/slices/<slug>/
├── slice.json              # contract, validated by validate-slice.mjs
├── config.ts               # defineFeature() — runtime metadata
├── index.ts                # public exports (components + hooks + types)
├── README.md               # consumer-facing usage doc
├── page.tsx                # optional — top-level route component
├── components/             # React components
│   └── <PascalCase>.tsx
├── hooks/                  # client hooks
│   └── use-<kebab>.ts
├── lib/                    # pure helpers, no React
│   └── <kebab>.ts
├── views/                  # optional — page-level compositions
├── types/                  # optional — shared TS types
└── settings/               # optional — settings panel components
```

**Props-driven rule**: slice components MUST NOT import from `convex/react` directly. Accept `onAction`, `data`, `status` props. Consumer wires Convex calls. This is what makes slices portable across projects with different backend state.

Exception: slice with `kind: full` MAY include thin `components/<Slug>Container.tsx` that DOES import `convex/react` as a convenience — but the underlying components stay props-driven.

## Preview page rules

```tsx
// app/preview/slices/<slug>/page.tsx
"use client";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 py-8">
        {/* slice demo — full-width, no header chrome */}
      </div>
    </main>
  );
}
```

- No `SlicePreviewLayout` wrapper.
- No nested `PreviewSection` cards.
- Full-width. Iframe provides chrome.
- Demo state via `useState` + URL `?param=value` for tunable variants.

## Compat declared at slice

Replace `lib/build/compat.ts` rules with slice-local declarations:

```ts
// frontend/slices/doku-payment/config.ts
export default defineFeature({
  slug: "doku-payment",
  compat: {
    requires: [],
    forbids: ["midtrans-payment", "stripe-payment"],
    templates: { allow: "*", deny: [] },
  },
});
```

Bundle builder reads each slice's `compat`, derives matrix at runtime. One source.

## Manifest schema (target)

```jsonc
{
  "version": 3,
  "generatedAt": "...",
  "repo": "rahmanef63/resource-site",
  "branch": "main",
  "templates": [...],   // tier-2 full apps
  "layouts": [...],     // tier-2 visual variants
  "slices": [...],      // tier-3 portable units (with embedded compat)
  "claudeSkills": [...] // MCP-exposed skills
}
```

Drop `features` + `recipes` collections. Migrated entries become slices.

## What to delete

After migration:

- `lib/build/compat.ts` (rules move into slices)
- `lib/content/recipes.ts` (migrate to slices)
- `lib/content/features.ts` (migrate to slices)
- `template-base/frontend/slices/*` facade folders (slices live at root only)
- `components/site/preview-pane.tsx` (PreviewFrame replaces)
- `components/slice-previews/preview-layout.tsx` (preview pages bare)
- Duplicate-slug exemption in `gen-manifest.mjs`

## Migration

See `docs/REFACTOR-PLAN.md` for phased execution. Phases summary:

1. Preview unify — collapse PreviewFrame + PreviewPane.
2. Slice home unify — move shared facade out, kill `template-base/frontend/slices/*`.
3. Recipes → slices migration — fold or deprecate.
4. Compat → slice-local — delete `lib/build/compat.ts`.
5. `slice.json` SSOT — make `lib/content/slices.ts` derive from disk.
6. Manifest v3 — drop dead collections.

Each phase = atomic PR. Don't bundle.

## Anti-spaghetti checklist

When adding new code, ask:

- [ ] Does this belong to **site**, **delivery**, **template-base**, or **kitab content**?
- [ ] If kitab content, is there an existing slice it extends?
- [ ] Am I creating a second home for an existing concept? (If yes, stop.)
- [ ] Is the import alias the canonical one for this concern?
- [ ] If preview, am I using `PreviewFrame`? If preview page, is it bare?
- [ ] If slice, does it have `slice.json` with `compat` declared locally?
- [ ] Did I avoid importing `convex/react` inside slice components?

Fail any check → revisit before merging.
