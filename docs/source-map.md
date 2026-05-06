# Source Map

Where each kitab artifact comes from. Copy-first flow — always cite source.

## Foundation (superspace)

| Target in template-base/ | Source |
|---|---|
| `frontend/shared/lib/features/{defineFeature,registry}.ts` | `superspace/frontend/shared/lib/features/` |
| `frontend/shared/ui/layout/container/three-column/*` | `superspace/frontend/shared/ui/layout/container/three-column/` |
| `frontend/shared/ui/layout/container/{two-column,single-column,split-view,ide}/*` | `superspace/frontend/shared/ui/layout/container/` |
| `frontend/shared/ui/layout/dashboard/*` | `superspace/frontend/shared/ui/layout/dashboard/` |
| `frontend/shared/ui/layout/sidebar/*` | `superspace/frontend/shared/ui/layout/sidebar/` |
| `frontend/shared/ui/layout/header/*` | `superspace/frontend/shared/ui/layout/header/` |
| `frontend/shared/ui/components/{ResponsiveDialog,SmartLink,FileUpload}.tsx` | `superspace/frontend/shared/ui/components/` |
| `frontend/shared/foundation/{utils,provider,hooks,types}/*` | `superspace/frontend/shared/foundation/` |
| `frontend/shared/settings/*` | `superspace/frontend/shared/settings/` |
| `frontend/shared/ai/agent/subAgentRegistry.ts` | `superspace/frontend/shared/ai/agent/` |
| `frontend/shared/preview/defineFeaturePreview.ts` | `superspace/frontend/shared/preview/` |
| `frontend/slices/_templates/*` | `superspace/frontend/slices/_templates/` |
| `frontend/slices/example/*` | `superspace/frontend/slices/example/` |
| `convex/lib/{rbac,audit,converters}/*` | `superspace/convex/lib/` |
| `convex/shared/{activity,comments,search,attachments,customFields}/*` | `superspace/convex/shared/` |
| `scripts/features/{create,list,edit,delete,sync,generate-registry}.ts` | `superspace/scripts/features/` |
| `scripts/validation/*` | `superspace/scripts/validation/` |
| `tsconfig.json` (path aliases) | `superspace/tsconfig.json` |
| `components.json` | `superspace/components.json` |

**Skip from superspace** (business-specific):
- All 46 business slices (staff-operations, guest-booking, owner-analytics, customer-loyalty, owner-transfers, daily-closing, petty-cash, pos, menus, etc.) — keep `_templates/` + `example/` only
- Clerk references in middleware.ts, app/sign-in/, app/sign-up/, providers
- `frontend/slices/overview/WorkspaceIntelligenceOverview.tsx` (`ws_laundry_567` hardcode)

## Motion + Theme (rahmanef)

| Target | Source |
|---|---|
| `frontend/shared/ui/motion/marquee.tsx` | `rahmanef.com/frontend/shared/ui/marquee.tsx` |
| `frontend/shared/ui/motion/kinetic-heading.tsx` | `rahmanef.com/frontend/shared/ui/kinetic-heading.tsx` |
| `frontend/shared/ui/motion/magnetic.tsx` | `rahmanef.com/frontend/shared/ui/magnetic.tsx` |
| `frontend/shared/ui/motion/cursor-spotlight.tsx` | `rahmanef.com/frontend/shared/ui/cursor-spotlight.tsx` |
| `frontend/shared/ui/motion/stat-counter.tsx` | `rahmanef.com/frontend/shared/ui/stat-counter.tsx` |
| `frontend/shared/ui/motion/reading-progress.tsx` | `rahmanef.com/frontend/shared/ui/reading-progress.tsx` |
| `frontend/shared/ui/motion/grain.tsx` | `rahmanef.com/frontend/shared/ui/grain.tsx` |
| `frontend/shared/ui/motion/lightbox.tsx` | `rahmanef.com/frontend/shared/ui/lightbox.tsx` |
| `frontend/shared/theme/{theme-presets,preset-fonts,preset-groups}.ts` | `rahmanef.com/frontend/shared/lib/` |
| `app/globals.css` (OKLch + presets) | `rahmanef.com/app/globals.css` |
| `app/layout.tsx` (font preload + JSON-LD) | `rahmanef.com/app/layout.tsx` |
| `app/providers.tsx` (Convex + Theme + Auth) | `rahmanef.com/app/providers.tsx` |
| `cookbook/layouts/landing-asymmetric-masonry/PortfolioGrid.tsx` | `rahmanef.com/frontend/slices/portfolio/components/PortfolioGrid.tsx` |

## Carousel + Contact (cescadesigns)

| Target | Source |
|---|---|
| `cookbook/layouts/landing-hero-carousel/HeroSection.tsx` | `cescadesigns/components/cummon/hero-section.tsx` |
| `recipes/contact-form-resend/ContactForm.tsx` | `cescadesigns/app/contact/` |
| (optional) `frontend/shared/ui/components/CardHoverEffect.tsx` | `cescadesigns/components/ui/card-hover-effect.tsx` |

## Notion Nested Slice (notion-page-clone — Vite → Next.js port)

| Target | Source |
|---|---|
| `frontend/slices/notion/slices/editor/*` | `notion-page-clone/src/slices/editor/` |
| `frontend/slices/notion/slices/workspace-sidebar/*` | `notion-page-clone/src/slices/workspace-sidebar/` |
| `frontend/slices/notion/slices/block-selection/*` | `notion-page-clone/src/slices/block-selection/` |
| `frontend/slices/notion/slices/databases/*` | `notion-page-clone/src/slices/databases/` |
| `frontend/slices/notion/slices/command-palette/*` | `notion-page-clone/src/slices/command-palette/` |
| `frontend/slices/notion/slices/comments/*` | `notion-page-clone/src/slices/comments/` |
| `frontend/slices/notion/slices/database-row/*` | `notion-page-clone/src/slices/database-row/` |
| `frontend/slices/notion/shared/{components,hooks,lib,types,ui}/*` | `notion-page-clone/src/shared/` |
| `convex/features/notion/*` | `notion-page-clone/convex/` (merged, not nested) |

**Port adjustments** (notion only):
- React Router `<BrowserRouter>` → remove (Next.js App Router native)
- `useNavigate()` → `useRouter()` from `next/navigation`
- `/src/app/routes/` → `app/dashboard/notion/{routes}/page.tsx`
- Add `"use client"` to all editor/sidebar files (contenteditable browser-only)
- Add path alias `@notion/*` → `./frontend/slices/notion/*` in tsconfig.json
- Find-replace inside `notion/`: `from "@/` → `from "@notion/`
- `lovable-tagger` Vite plugin: drop from devDeps
- Zustand store: add hydration guard for SSR
- `vite.config.ts`: delete

## Studio Slice (superspace — archived source)

Extracted P10 from `superspace@aeced78a` (commit ref: `chore(studio): archive feature → docs/archive/studio/`). Lives in template-base as a beta slice. Full contract in `template-base/frontend/slices/studio/EXTRACTED.md`.

| Target in template-base/ | Source |
|---|---|
| `frontend/slices/studio/*` (385 files) | `superspace/docs/archive/studio/frontend-slice/` |
| `convex/features/studio/*` (13 files) | `superspace/docs/archive/studio/convex-feature/` |
| `app/studio/preview/page.tsx` | `superspace/docs/archive/studio/app-route/preview/page.tsx` |
| `tests/features/studio/*` (4 files, `describe.skip`) | `superspace/docs/archive/studio/tests/` |
| `frontend/shared/builder/{registry,SharedCanvasProvider,UnifiedInspector,UnifiedLibrary}` (4 fork-divergent files; 110 others already byte-identical) | `superspace/frontend/shared/builder/` |
| `frontend/shared/ui/{dashboard,icons,color-picker}/*` | `superspace/frontend/shared/ui/` |
| `lib/features/{constants,package-contract,workspace-install}.ts` | `superspace/lib/features/` |
| `convex/features/ai/lib/types.ts` (FeatureAgent) | `superspace/convex/platform/ai/lib/types.ts` (relocated to satisfy studio's `../../ai/lib/types` relative path) |

**Stripped on the receiving side** (single-tenant kitab):
- `convex/auth/helpers.ts` → no-op stub (requirePermission/requireActiveMembership/canPermission return placeholder, never throw). Re-merge to superspace = swap helpers back, zero call-site edits.
- `convex/features/database/utils.ts::hasWorkspaceAccess` → returns `Boolean(userId)` (single-tenant means signed-in = access).

**Wired during extraction**:
- Root `convex/schema.ts` composes `authTables + notionTables + studioTables + studioAgentTables`. Notion's `schema.ts` got a named `notionTables` export (default `defineSchema(...)` preserved — zero behavioral impact).
- `convex/_generated/{api,server,dataModel}.{d.ts,js}` hand-written stubs so `tsc --noEmit` runs without an authenticated Convex deployment. **Overwritten on first `npx convex dev`** — runtime intentionally broken until then.
- Vendored peer deps in package.json: `reactflow`, `react-syntax-highlighter`, `@types/react-syntax-highlighter`, `html-to-image`, `ajv`, `ajv-formats`, `react-markdown`, `zustand`.

## What we DON'T copy from anywhere

- `node_modules/`
- `.next/`
- `convex/_generated/` (regenerate locally per project)
- `.git/`
- environment files (`.env*` except `.env.example`)
- lockfiles (regenerate with `npm install --yes --legacy-peer-deps`)
