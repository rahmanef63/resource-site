# Per-project harvest prompts

Copy-paste prompts for preparing a feature in each consumer project before pushing UP to kitab. Pipeline is always **two-step**:

```
/rr-prep <slug> --fix      → emits .harvest/{prep-report.md, slice.manifest.draft.json, …}
/rr-send <slug>            → cross-repo copy + manifest + PR to resources/main
```

`/rr-prep` runs IN the consumer (audit + safe auto-fix). `/rr-send` reads `.harvest/` and harvests UP.

If `/rr-prep` reports anything other than **READY**, fix the surfaced issues (or run with `--fix` to auto-resolve mechanical ones), re-run prep, then `/rr-send`.

Don't push to `resources/main` directly — `/rr-send` opens a PR.

---

## 1. notion-page-clone

Repo: `/home/rahman/projects/notion-page-clone` · Slice base: `frontend/slices/<slug>/` · Convex base: `convex/<feature>/` (flat)

Most notion slices are **nested** — they live under `frontend/slices/notion/slices/<inner>/`. Pass the INNER path, not the wrapper.

### Candidate features (highest leverage first)

| Slug | Path | Why harvest |
|---|---|---|
| `menu-actions` | `frontend/slices/notion/slices/menu-actions` | Page-corner menu (rename, archive, duplicate, share). Universal — every Notion-like app needs this. |
| `block-selection` | `frontend/slices/notion/slices/block-selection` | Multi-block select + drag. Hard to get right; this one works. |
| `command-palette` | `frontend/slices/notion/slices/command-palette` | Cmd-K palette w/ contextual actions. Reusable across superspace + CareerPack. |
| `editor` | `frontend/slices/notion/slices/editor` | Block editor + slash menu. Largest slice — likely needs decomp first. |
| `databases` | `frontend/slices/notion/slices/databases` | 11 view types (table/board/gallery/calendar/etc.). High value but complex deps. |
| `comments` | `frontend/slices/notion/slices/comments` | Threaded comments w/ mentions. |
| `workspace-sidebar` | `frontend/slices/notion/slices/workspace-sidebar` | Page tree dnd sidebar. |

### Prompt to fire

```bash
cd /home/rahman/projects/notion-page-clone
git checkout main && git pull
git checkout -b harvest-prep/menu-actions

# Run preflight + apply safe fixes
/rr-prep frontend/slices/notion/slices/menu-actions --fix

# Inspect: frontend/slices/notion/slices/menu-actions/.harvest/prep-report.md
# When status: READY → push UP
/rr-send menu-actions
```

### Project gotchas

- **Inner slice path**: `frontend/slices/notion/slices/<inner>` (nested). Pass the inner path verbatim — `/rr-prep` detects nesting automatically.
- **`@notion/*` alias**: paths inside notion-private slices may use `@notion/*` (tsconfig alias). Sanitizer rewrites to `@/features/<slug>/*` during prep.
- **Utils path**: notion uses `@/shared/lib/utils` (not `@/lib/utils`). Sanitizer translates to `rahman-shared/lib/utils`.
- **Outstanding backlog**: 53 cross-slice imports across notion (pre-existing). If your target slice trips Step 4 of prep, it's likely part of that backlog — surface, don't try to fix everything in one harvest.
- **TS strict errors**: 40 known. Not blockers for harvest; surface them in `.harvest/prep-report.md` as project hygiene followups.

---

## 2. superspace

Repo: `/home/rahman/projects/superspace` · Slice base: `frontend/slices/<slug>/` (tier-3) · Convex base: `convex/features/<slug>/`

Superspace is the **most coupled** project (50 features). Heaviest harvests — start with smaller / self-contained slices.

### Candidate features

| Slug | Path | Why harvest |
|---|---|---|
| `platform-admin` | `frontend/slices/platform-admin` | 17-section admin shell. Pairs with kitab's `template-base/frontend/slices/admin-panel/`. |
| `accounting` | `frontend/slices/accounting` | Bookkeeping (P&L, balance sheet, ledger entries). Workspace-isolated. |
| `pos` | `frontend/slices/pos` | Point-of-sale w/ payment, receipt, refund. |
| `cms-lite` | `frontend/slices/cms-lite` | Public CMS (posts, products, portfolio, services). |
| `daily-closing` | `frontend/slices/daily-closing` | End-of-day reconciliation. |
| `petty-cash` | `frontend/slices/petty-cash` | Small-cash tracking. |
| `damage-reports` | `frontend/slices/damage-reports` | Incident logging. |
| `events` | `template-base/frontend/slices/admin-panel/slices/events` (already in kitab via SDK; harvest the latest superspace impl as update) | Event tracking SDK. |

### Prompt to fire

```bash
cd /home/rahman/projects/superspace
git checkout main && git pull
git checkout -b harvest-prep/accounting

# Phase 5.5 (Clerk → Convex Auth) work is gated — only harvest features that
# don't import Clerk hooks. If your slice uses useUser/useAuth/etc, sub them
# for useCurrentUser() (kitab-canonical) in a separate PR FIRST, then prep.
/rr-prep frontend/slices/accounting --fix

# Read the report:
cat frontend/slices/accounting/.harvest/prep-report.md

# If READY:
/rr-send accounting
```

### Project gotchas

- **Tier-3 contract**: every slice has `config.ts` exporting `defineFeature({...})`. `/rr-prep` preserves this — kitab respects it.
- **Tables already namespaced**: `<slug>_<table>` convention met. Step 8 (schema audit) usually no-op.
- **Clerk drop in progress**: Phase 5.5 pending. Slices that DIRECTLY import `@clerk/nextjs` need rewrite to `useCurrentUser()` first. Most slices already proxy via AuthProviderGate so this is rarer than feared.
- **Convex backend**: lifts to `convex/features/<slug>/`. Schema merges via `convex/features/index.ts` — `/rr-send` regenerates this.
- **TS2589 risk**: huge `api` namespace. If you hit "Type instantiation is excessively deep", use `any-api` escape hatch from `@/frontend/shared/foundation/utils/convex/any-api`.

---

## 3. CareerPack

Repo: `/home/rahman/projects/CareerPack` · Slice base: `frontend/src/slices/<slug>/` (legacy `src/` prefix) · Convex base: `convex/<domain>/` (flat)

CareerPack is mid-migration — `frontend/src/slices` rename to `frontend/slices` pending (254 tsc errors from deep `../convex` imports block this).

### Candidate features

| Slug | Path | Why harvest |
|---|---|---|
| `resume-matcher` | `frontend/src/slices/resume-matcher` | Resume ↔ job-description match scoring. Unique to CareerPack. |
| `application-tracker` | `frontend/src/slices/application-tracker` | Kanban-style application pipeline. |
| `cover-letter-builder` | `frontend/src/slices/cover-letter-builder` | AI-assisted cover letter drafting. |
| `interview-prep` | `frontend/src/slices/interview-prep` | Q&A prep w/ STAR templates. |
| `network-tracker` | `frontend/src/slices/network-tracker` | Contact tracking + outreach. |

### Prompt to fire

```bash
cd /home/rahman/projects/CareerPack/frontend
pnpm install --frozen-lockfile

git checkout main && git pull
git checkout -b harvest-prep/resume-matcher

# Path is src/slices, not slices — pass exactly:
/rr-prep src/slices/resume-matcher --fix

# Inspect report
cat src/slices/resume-matcher/.harvest/prep-report.md

# If READY:
/rr-send resume-matcher
```

### Project gotchas

- **Legacy `frontend/src/slices/` path**: not `frontend/slices/`. Sanitizer normalizes during harvest — destination in kitab is always `frontend/slices/<slug>/`.
- **pnpm workspace**: CareerPack uses `--filter=careerpack-frontend`. Background commands inside the workspace must respect filter or `cd frontend/` first.
- **Deep `../convex` imports**: 254 tsc errors known. Slices using `../../../../convex/...` paths trip Step 4 of prep. Either (a) refactor to `@convex/*` alias FIRST (backlog work), or (b) accept surfaced WARN and harvest anyway — kitab sanitizer rewrites these.
- **Workspace isolation**: CareerPack workspaces are per-user (single-tenant style). Tables already have user-scoped indexes, but rename to `by_workspace` during harvest for kitab parity.

---

## 4. content-rahmanef-com

Repo: `/home/rahman/projects/content-rahmanef-com` · Slice base: `frontend/slices/<slug>/` OR `components/templates/<tpl>/slices/<slug>/`

Two slice locations — confirm with user which kind during prep.

- `frontend/slices/<slug>/` — **reusable** slice (e.g. shared blog editor)
- `components/templates/<tpl>/slices/<slug>/` — **template-coupled** slice (specific to a content template like `dark-tech` or `light-portfolio`)

Reusable → harvest to `resources/frontend/slices/`. Template-coupled → harvest to `resources/template-base/frontend/slices/`.

### Candidate features

| Slug | Source kind | Path | Why harvest |
|---|---|---|---|
| `blog-editor` | reusable | `frontend/slices/blog-editor` | MDX editor w/ preview. Reusable across content sites. |
| `portfolio-grid` | reusable | `frontend/slices/portfolio-grid` | Masonry portfolio grid. (Also exists at rahmanef.com — keep one canonical.) |
| `tag-cloud` | reusable | `frontend/slices/tag-cloud` | Tag faceting. |
| `reading-progress` | reusable | `frontend/slices/reading-progress` | Article reading progress bar. (Belongs in `resources/shared/ui/` actually — see rahmanef.com section.) |
| `dark-tech-hero` | template-coupled | `components/templates/dark-tech/slices/hero` | Cinematic hero specific to dark-tech template. |
| `light-portfolio-hero` | template-coupled | `components/templates/light-portfolio/slices/hero` | Hero for light-portfolio. |

### Prompt to fire

```bash
cd /home/rahman/projects/content-rahmanef-com
git checkout main && git pull
git checkout -b harvest-prep/blog-editor

# /rr-prep auto-detects location based on path:
/rr-prep frontend/slices/blog-editor --fix

# Or for template-coupled:
/rr-prep components/templates/dark-tech/slices/hero --fix

# Inspect:
cat frontend/slices/blog-editor/.harvest/prep-report.md

# Hand-off:
/rr-send blog-editor
```

### Project gotchas

- **Already on `rahman-shared`**: this project adopted via `/rr-adopt` (2026-05-13). Imports of `cn`/`formatDate`/etc already resolve to npm package. Sanitizer's import-rewrite step is mostly no-op.
- **Two slice locations**: confirm with user which kind. If unsure, default to `frontend/slices/` (reusable).
- **Template tokens**: template-coupled slices may use theme tokens specific to that template (e.g. `--dark-tech-accent`). Harvest as-is; consumer of the kitab slice overrides tokens locally.
- **i18n**: content site is bilingual (en/id). Strings may be `t("key")` calls. Surface in `.harvest/prep-report.md` — kitab may want i18n keys harvested too.

---

## 5. rahmanef.com

Repo: `/home/rahman/projects/rahmanef.com` · Slice base: `frontend/slices/<slug>/` · Convex base: `convex/<slug>/` (some slices are static, no Convex)

**ALERT**: motion primitives + theme presets live in `frontend/shared/ui/` and `frontend/shared/lib/`, NOT in slices. These belong in **`resources/shared/ui/`** and **`resources/shared/lib/`** — not as slices.

`/rr-prep` auto-detects motion primitive paths and recommends the alternate target.

### Candidate features

| Slug | Source kind | Path | Why harvest |
|---|---|---|---|
| `portfolio-grid` | slice | `frontend/slices/portfolio/components/PortfolioGrid.tsx` | Asymmetric masonry grid. Canonical version (also in content-rahmanef-com — pick one). |
| `marquee` | **shared/ui** | `frontend/shared/ui/marquee` | Animated marquee. Belongs in `resources/shared/ui/`. |
| `kinetic-heading` | **shared/ui** | `frontend/shared/ui/kinetic-heading` | Animated text heading. |
| `magnetic` | **shared/ui** | `frontend/shared/ui/magnetic` | Magnetic cursor hover. |
| `cursor-spotlight` | **shared/ui** | `frontend/shared/ui/cursor-spotlight` | Spotlight effect under cursor. |
| `stat-counter` | **shared/ui** | `frontend/shared/ui/stat-counter` | Number tick-up counter. |
| `reading-progress` | **shared/ui** | `frontend/shared/ui/reading-progress` | Progress bar. |
| `grain` | **shared/ui** | `frontend/shared/ui/grain` | Grain noise overlay. |
| `lightbox` | **shared/ui** | `frontend/shared/ui/lightbox` | Image lightbox modal. |
| `theme-presets` | **shared/lib** | `frontend/shared/lib/theme-presets.ts` + siblings | OKLch theme system. Config artifact, not a slice. |

### Prompt to fire (slice path)

```bash
cd /home/rahman/projects/rahmanef.com
git checkout main && git pull
git checkout -b harvest-prep/portfolio-grid

/rr-prep frontend/slices/portfolio --fix
cat frontend/slices/portfolio/.harvest/prep-report.md
/rr-send portfolio
```

### Prompt to fire (motion primitive — alternate target)

```bash
cd /home/rahman/projects/rahmanef.com
git checkout main && git pull
git checkout -b harvest-prep/marquee

/rr-prep frontend/shared/ui/marquee --fix

# /rr-prep detects shared/ui/* path and emits:
#   "Suggested target: resources/shared/ui/marquee/ (not frontend/slices/)"
# in the prep-report.md. Confirm before send.

/rr-send marquee --target shared/ui
```

### Project gotchas

- **No Convex on most slices** — portfolio + hero are static SSG. Step 7/8 (Convex audit) auto-skip.
- **Tailwind v3 still**: project hasn't bumped to v4. shadcn primitives output should target v3 syntax. Sanitizer flags Tailwind v4 features (e.g. `@theme` directive) as project-incompatible.
- **Adopted `rahman-shared`**: imports of `cn` come from npm. No-op for import rewrite.
- **Motion primitives = shared, not slices**: kitab convention says they live in `resources/shared/ui/`. `/rr-prep` detects + recommends. If you accept, `/rr-send <slug> --target shared/ui` places in correct tree.
- **Theme presets**: harvest as a single file artifact, not a slice. `/rr-send theme-presets --target shared/lib`.

---

## Convex-only harvest (rare)

If a feature is BACKEND ONLY (no frontend slice), pass the convex path directly:

```bash
/rr-prep convex/features/<slug> --fix
```

`/rr-prep` infers it's a backend-only and skips frontend-specific steps (UI primitive sweep, README slot table). Hand-off:

```bash
/rr-send <slug>
```

destination: `resources/convex/features/<slug>/` (no `frontend/slices/` counterpart created).

---

## After every harvest

The PR opened by `/rr-send` includes:
- `frontend/slices/<slug>/` (or `template-base/` / `shared/ui/` based on target)
- `convex/features/<slug>/` (if backend exists)
- `slice.manifest.json` filled from prep draft
- `lib/content/slices.ts` entry
- Regenerated `packages/cli/lib/manifest.json`

Validators run automatically: `validate.mjs`, `validate-slice.mjs`, `validate-slice-parity.mjs`, `validate-structure.mjs`, `sync-skills.mjs --check`. PR blocks on validator failure.

If the surface impacts `packages/cli` or `packages/mcp`, `/rr-send` reminds you to bump version + republish. See `CLAUDE.md` § Publishing for the exact command.

---

## Quick lookup

| Want | Command |
|---|---|
| Audit feature, fix what's safe | `/rr-prep <path> --fix` |
| Audit only, no auto-fix | `/rr-prep <path> --dry-run` |
| Harvest UP after READY | `/rr-send <slug>` |
| Harvest to shared/ui (motion etc) | `/rr-send <slug> --target shared/ui` |
| Pull kitab npm to a new consumer | `/rr-adopt` (inside the consumer) |
| Check structure + BP | `/use-audit-bp` (covers audit-structure too as of 2026-05-14) |

---

_Generated 2026-05-14 alongside the `/rr-*` skill rename. Update this doc whenever a new consumer is added or feature lists shift._
