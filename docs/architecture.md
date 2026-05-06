# Architecture

## Why vertical-slice

Each feature lives in `frontend/slices/{slug}/` with its own `config.ts`, `page.tsx`, `views/`, `components/`, `shared/`, `settings/`, `agent/`, `types/`, `docs/`. Backend mirror at `convex/features/{slug}/`.

Benefits:
- Add/remove a feature = add/remove one folder. No cross-cutting hunt.
- Auto-discovery via `frontend/shared/lib/features/registry.ts` (generated).
- Validators enforce contract: every slice has required files; `defineFeature.status` matches reality.

## Layers

```
app/                    # Next.js App Router entrypoints (route groups)
frontend/slices/        # vertical features
frontend/shared/        # cross-feature foundation (lib, ui, foundation, theme, motion)
convex/features/        # backend mirror per slice
convex/shared/          # cross-feature backend (activity, comments, search, attachments)
convex/lib/             # rbac, audit, converters
scripts/                # CLI: create:feature, sync:all, validate:*, generate-slice-docs
```

## Route Groups (rahmanef pattern)

- `app/(marketing)/` — public landing, no auth JS preload, SEO-first
- `app/(content)/` — blog, projects, playground (Convex read-only)
- `app/(cms)/` — public storefront (Convex read-only with cart)
- `app/dashboard/` — auth shell, feature router (mounts slices)
- `app/admin/` — CRUD admin

## Layouts (cookbook)

| Layout | Use when |
|---|---|
| `dashboard-three-column` | rich app (database, tasks, contacts) — left tree / main / right inspector |
| `dashboard-ide` | editor-first (notion, code) — activity bar + tabs + panels |
| `dashboard-mobile-dock` | mobile-first auth app — bottom dock nav |
| `landing-hero-carousel` | marketing site with image rotation |
| `landing-asymmetric-masonry` | portfolio / showcase |
| `landing-bento` | feature-grid marketing |
| `landing-kinetic-text` | brand-forward, motion-heavy |
| `cms-public-storefront` | e-commerce / blog public reads |

## Studio Slice (flagship feature)

`frontend/slices/studio/` is the kitab's flagship vertical slice — UI-builder + workflow-automation unified under one feature. Extracted P10 from `superspace@aeced78a` as a clean move (archived in source, live here). Beta state.

Pairs with `frontend/shared/builder/` (registry + canvas provider + inspector + library) — 4 files synced from superspace fork, 110 already byte-identical with template-base. Builder stays at `frontend/shared/builder/` (alias `@/shared/builder`) instead of relocating to `packages/builder/` — deviation from manifest, justified in `frontend/slices/studio/EXTRACTED.md`.

Re-merge contract back to superspace: publish `@resources/studio` (+ `@resources/builder` optional), restore real RBAC helpers in `convex/auth/`, replace `frontend/slices/studio/page.tsx` in superspace with a thin re-export. See `docs/studio-extraction.md`.

## Notion Nested Slice

`frontend/slices/notion/` is the only **slice-of-slices** in the kitab. Justification: notion features (block editor, databases, comments, command palette) are tightly coupled by data model + selection state, but each is a discrete unit. Nesting preserves vertical-slice contract internally while presenting as one feature externally.

Path alias `@notion/*` isolates notion's import world. Convex code flattens to `convex/features/notion/` to avoid generator recursion issues.

## Audit gate

Every PR touching slices must pass `audit-bp --changed` ≥80. CI enforced. See `audit.md`.

## Deploy gate

First deploy via `/use-si-coder`. Self-hosted Convex + Next.js in single docker-compose. `convex/_generated` MUST be committed. See `deploy.md`.
