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

## Phase 3 — Recipes & features → slices

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

## Phase 4 — Compat declared per slice

**Goal**: each slice declares its own `compat`. Delete `lib/build/compat.ts` rules table.

**Smell**: compat matrix scattered between `lib/build/compat.ts` + `lib/content/slices.ts` (peers/providers).

**Steps**:
1. Add `compat: { requires, forbids, templates }` to slice's `config.ts` (defineFeature).
2. Bundle builder + validators read compat from each slice config, derive matrix at runtime.
3. Migrate existing rules from `lib/build/compat.ts` → individual slice configs (one slice at a time, atomic).
4. Delete `lib/build/compat.ts` entirely once all rules migrated.

**Done when**:
- No imports of `lib/build/compat.ts` anywhere.
- Bundle builder still rejects incompatible combos.
- `lib/build/compat.ts` deleted.

**Risk**: low. Mechanical migration.

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
| 2 — Slice home unify | ✅ Done 2026-05-12 | (this) | Killed `full-width-toggle` dup. Revised rule to dual-home-by-category. |
| 3 — Recipes → slices | Not started | — | |
| 4 — Compat per slice | Not started | — | |
| 5 — slice.json SSOT | Not started | — | |
| 6 — CI enforcement | Not started | — | |

Update on phase completion.

## Out of scope (intentionally)

- No runtime DI / dynamic loading.
- No semver gymnastics across slices — kitab stays kitab-wide versioned.
- No rewrite of existing templates from monolithic → slice-composed. (Future plan.)
- No migration of `convex-templates/` separately — folded into per-slice convex dirs.
