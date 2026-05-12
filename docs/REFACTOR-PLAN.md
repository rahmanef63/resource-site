# Refactor Plan — Toward Ideal Structure

> Status: Draft v1 — 2026-05-12
> Companion to `docs/STRUCTURE.md`. Target = STRUCTURE.md. This doc = phased path.

## Principle

One atomic PR per phase. No bundling. Each phase must:

- Land green (`tsc --noEmit` + manifest regen passes).
- Update `docs/PROGRESS.md` with phase done.
- Leave repo in a working state (no half-migrations).

## Phase 1 — Preview unification ✅ Done 2026-05-12

**Goal**: kill duplicate iframe shell rendering.

**Outcome**: Extract `PreviewIframeShell` (pure renderer) as the single home for {viewport-sized iframe + scaled transform + segmented hinge overlay}. Both `PreviewFrame` (self-chromed) and `PreviewPane` (context-driven) consume it.

**Why not delete PreviewPane**: After reading code, the two components serve LEGITIMATELY different page patterns:
- `PreviewFrame` — self-chromed: own toolbar with view/zoom/fullscreen. Used by slice docs + bundle builder + standalone previews.
- `PreviewPane` — headless context-driven: state lives in `feature-context`, chrome rendered globally by `feature-bar` for template-detail's tab UI.

Forcing both into one component requires "controller" plumbing that doesn't pay off. The duplicate logic was the iframe shell rendering — that's deduped.

**Landed**:
- `components/site/preview-shell.tsx` — new, `PreviewIframeShell` (149 LOC, includes single SegmentedFrame).
- `components/site/preview-frame.tsx` — uses shell. Inline `SegmentedFrame` deleted.
- `components/site/preview-pane.tsx` — 126→46 LOC. Inline `SegmentedIframe` deleted.

**Future option**: if context-driven mode is no longer needed (e.g., template-detail moves to inline chrome), revisit deleting PreviewPane in a later phase.

---

## Phase 2 — Slice home unification ✅ Done 2026-05-12

**Goal**: kill same-slug-in-two-homes ambiguity. Define category-based home rule.

**What changed from original plan**: After investigation, found that moving foundation slices (command-menu, motion-primitives, responsive-dialog, dashboard-shell) to root would require:
- Moving `template-base/frontend/shared/*` to root, OR
- Rewriting facade re-exports + adding cross-tree path aliases

Both = deep restructure violating "hindari rewrite, update imports saja". Real spaghetti was the BYTE-IDENTICAL DUP of `full-width-toggle` in both homes. Killed that; revised rule to acknowledge two valid categories.

**Categories**:
- **Portable slice**: self-contained, no `@/frontend/shared/*` imports → root `frontend/slices/<slug>/`
- **Foundation slice**: facade over `template-base/frontend/shared/*` → `template-base/frontend/slices/<slug>/`
- Each slug lives in EXACTLY one directory.

**Landed**:
- `git rm -r template-base/frontend/slices/full-width-toggle` (byte-identical dup, root is canonical because self-contained).
- Manifest regen passes (14 slices, no dup-slug errors).
- `tsc --noEmit` green.
- `docs/STRUCTURE.md` R1 updated to reflect category split + dual-home-by-category rule.

**Post-state**:
- template-base/frontend/slices: `_templates, admin, command-menu, dashboard-shell, example, industry-templates, motion-primitives, notion, reports, responsive-dialog, studio` (foundation + tier-2 baked-in)
- frontend/slices: `_templates, ai-router, broadcast-channel-sync, cal-com-booking, convex-auth, doku-payment, full-width-toggle, mdx-blog, midtrans-payment, resend-newsletter, vector-search` (portable)
- Zero overlap.

**Deferred to Phase 6 CI**: `scripts/validate-slice-homes.mjs` to enforce no-dup + category-correct placement.

---

## Phase 3 — Recipes & features → slices ✅ Done 2026-05-12

**Landed**:

Categorized 12 recipes:

| Recipe | Action | Slice destination |
|---|---|---|
| rbac-roles | Promoted | `rbac-roles` (backend, slicePath empty, convexPaths → template-base/convex/lib/rbac) |
| admin-panel | Promoted | `admin-panel` (full, template-base/frontend/slices/admin) |
| event-tracking | Promoted | `event-tracking` (full, lives under admin slice) |
| theme-preset-switcher | Promoted | `theme-preset-switcher` (ui, template-base/frontend/shared/theme) |
| icon-picker | Promoted | `icon-picker` (ui, template-base/frontend/slices/notion/slices/icon-picker) |
| contact-form-resend | Promoted + moved | `contact-form-resend` (full, template-base/frontend/slices/contact-form-resend — was `recipes/contact-form-resend/src/`) |
| command-palette | Dropped (dup) | covered by existing `command-menu` slice |
| doku-payment | Dropped (dup) | already a slice |
| block-editor, page-tree-sidebar, multi-block-selection, database-views, comments-threaded | Dropped | notion sub-features — live INSIDE `notion` slice, not portable standalone |

**Terminal ops**:
```bash
git mv recipes/contact-form-resend/src/{page.tsx,components} → frontend/slices/contact-form-resend/ → template-base/frontend/slices/contact-form-resend/
git rm -r recipes/{admin-panel,block-editor,command-palette,comments-threaded,database-views,doku-payment,event-tracking,icon-picker,multi-block-selection,page-tree-sidebar,rbac-roles,theme-preset-switcher}
rmdir recipes/contact-form-resend recipes
```

(Moved contact-form-resend twice: into root portable, then into template-base when tsc revealed convex/react + framer-motion deps. Matches dual-home-by-category rule.)

**Edits**:
- `lib/content/slices.ts` — appended 6 new slice entries.
- `lib/content/recipes.ts` — emptied. Type + getRecipe stub kept for back-compat with 14 importers (sitemap, llms.txt, sidebar, command-palette, hero, admin export, knowledge API, etc.).
- `next.config.mjs` — 14 new `/recipes/*` → `/slices/*` redirects.
- `packages/cli/scripts/gen-manifest.mjs` — removed feature↔slice duplicate-slug exemption (dead code: features derived from slices).

**Post-state**: manifest now `15 layouts + 0 recipes + 20 features + 20 slices`. tsc green.

**Deferred**:
- Delete recipes.ts entirely + remove all 14 import sites — Phase 6 (CI structural-check pass).
- Manifest schema bump v2 → v3 — Phase 6 (needs CLI/MCP coordination).

---

## ~~Phase 3 — Recipes & features → slices~~ (original plan, superseded)

**Goal**: collapse `recipes` + `features` collections into `slices` with `kind: ui`.

**Smell**: `gen-manifest.mjs:128-138` has duplicate-slug exemption for feature↔slice. Conceptual overlap.

**Steps**:
1. Audit `lib/content/recipes.ts` + `lib/content/features.ts` entries. Categorize:
   - **Real slice candidate**: write `slice.json` + minimal code drop, move to `frontend/slices/<slug>/`.
   - **Reference-only** (docs link + npm hint, no code): keep as `slice` entry with `kind: "ui"` + `installPaths: {}` (registry-only, no copy).
   - **Dead**: delete.
2. Remove `recipes` + `features` from `gen-manifest.mjs` output.
3. Delete `lib/content/recipes.ts` + `lib/content/features.ts`.
4. Remove duplicate-slug exemption from manifest generator. Strict uniqueness.
5. Bump manifest schema to v3.
6. Update site routes: `/recipes/[slug]` → redirect to `/slices/[slug]`.

**Done when**:
- Only `templates` + `layouts` + `slices` + `claudeSkills` in manifest.
- No `features.ts` / `recipes.ts` files.
- Site recipe routes 301 to slices.

**Risk**: medium-high. Slug renames break external bookmarks. Need redirect map.

---

## Phase 4 — Compat declared per slice ✅ Done 2026-05-12

**Landed**:
- Added `CompatStatus`, `SliceCompatEntry`, `SliceCompat` types to `lib/content/slices.ts`.
- Added `compat?: SliceCompat` field to `SliceEntry`.
- Migrated all data from `MATRIX` (per-template) + `SLICE_COMPAT` (peers/conflicts) → each slice's `compat` field. 9 slices got compat declarations (convex-auth, doku-payment, midtrans-payment, resend-newsletter, ai-router, vector-search, mdx-blog, cal-com-booking, broadcast-channel-sync).
- Rewrote `lib/build/compat.ts` as a thin derivation layer (~80 LOC, was ~162). Same public surface (`getCompat`, `SLICE_COMPAT`, `collectWarnings`, types) so 4 consumers (build-shell, slice-picker, feature-picker, command-output) compile unchanged.

**Why kept compat.ts (vs delete entirely)**:
- Consumers expect `SLICE_COMPAT` as a `Record<string, SliceCompat>` const — derived once at module load.
- `getCompat()`/`collectWarnings()` are stable helper functions — easier to keep one import path.
- Deletion is mechanical but breaks the named-export surface — defer until any caller refactor is needed.

tsc + manifest regen green. Authors now edit ONE place (slice entry) to update compat.

---

## Phase 5 — `slice.json` as single source

**Goal**: `lib/content/slices.ts` reads from disk (`slice.json` per folder), no hand-typed registry.

**Smell**: `SliceEntry` in `lib/content/slices.ts` has 17+ fields duplicating what could live in `slice.json`. Authors edit two files.

**Steps**:
1. Define canonical `slice.json` schema (TS type) — covers all fields currently in `SliceEntry`.
2. Write `lib/content/slices.ts` as a build-time function: scan `frontend/slices/*/slice.json` → return `SliceEntry[]`.
3. Migrate each slice: move metadata from `lib/content/slices.ts` entry into `frontend/slices/<slug>/slice.json`.
4. `lib/content/slices.ts` becomes a getter — no hardcoded entries.
5. Update `parse-content.mjs` if it relies on AST parse — switch to filesystem scan.

**Done when**:
- `lib/content/slices.ts` is < 30 LOC (just the scanner).
- Authors edit only `slice.json` to add/modify slices.
- Manifest regen still produces identical output.

**Risk**: medium. Build-time scan adds I/O dependency. Caches needed for dev hot-reload.

---

## Phase 6 — Polish & enforcement

**Goal**: anti-spaghetti checks in CI.

**Steps**:
1. Add `scripts/validate-structure.mjs`:
   - Reject files in `template-base/frontend/slices/` (must be empty except `_templates` + `example`).
   - Reject `convex/react` imports in `frontend/slices/<slug>/components/*` (props-driven rule).
   - Reject duplicate slugs across taxonomies.
   - Reject imports of deleted modules (`lib/build/compat.ts`, etc.).
2. Wire into `npm run validate` + GitHub Actions.
3. Update `audit-bp` thresholds.
4. Archive completed migration docs to `docs/done/`.

**Done when**:
- CI fails on structural violations.
- `docs/STRUCTURE.md` matches reality 1:1.
- This file → `docs/done/REFACTOR-PLAN.md`.

---

## Progress tracker

| Phase | Status | PR | Notes |
|---|---|---|---|
| 1 — Preview unify | ✅ Done 2026-05-12 | 4fed77c | Extracted `PreviewIframeShell` shared renderer. PreviewPane: 126→46 LOC. SegmentedFrame defined once. |
| 2 — Slice home unify | ✅ Done 2026-05-12 | f0c077c | Killed `full-width-toggle` dup. Revised rule to dual-home-by-category. |
| 3 — Recipes → slices | ✅ Done 2026-05-12 | 44cb672 | 12 recipes → 6 promoted slices + 6 dropped (notion sub-features + dup). recipes.ts emptied, dup-slug exemption removed. |
| 4 — Compat per slice | ✅ Done 2026-05-12 | (this) | Moved MATRIX + SLICE_COMPAT data into each slice's `compat` field. compat.ts now ~80 LOC derivation layer; consumers unchanged. |
| 5 — slice.json SSOT | Not started | — | |
| 6 — CI enforcement | Not started | — | |

Update on phase completion.

## Out of scope (intentionally)

- No runtime DI / dynamic loading.
- No semver gymnastics across slices — kitab stays kitab-wide versioned.
- No rewrite of existing templates from monolithic → slice-composed. (Future plan.)
- No migration of `convex-templates/` separately — folded into per-slice convex dirs.
