# Site Simplification + Layout-Consistency Ultraplan

> Goal: make the public docs-site (`app/(docs)/*` + `app/page.tsx`) **easy to
> read and navigate** — reduce cognitive load, unify every page's shell — **without
> removing a single feature**. Every route stays; we regroup, unify, and de-duplicate.

Audit date: **2026-05-30** (3 parallel explorers: IA/nav, layout, visual system).

---

## Diagnosis — why it feels "pusing"

The visual foundation is already good: coherent OKLch token system, Geist Sans/Mono,
no hardcoded colors. The pain is **structure**, three root causes:

1. **IA sprawl + two disagreeing navs.** `components/site/top-navbar.tsx` (7 flat
   items, labels "Modules"→`/slices`) and `components/site/docs-sidebar/build-sections.ts`
   (5 sections, label "Slices") tell different stories. 15 top-level sections, flat.
2. **Broken `/recipes`.** Sidebar lists "All recipes" + per-recipe leaves from
   `lib/content/recipes`, but **no `app/(docs)/recipes/` page exists** → every recipe
   link 404s. The data exists; the page was never built.
3. **No canonical page shell.** `DocsShell` constrains `max-w-3xl`, yet 4 pages add
   their *own* `max-w-3xl` (double constraint: mcp, architecture, directory,
   installation), changelog escapes with `-mx-4`, build is fully isolated, headers are
   hand-rolled 7 different ways, spacing flips between `space-y-8`/`space-y-6`/ad-hoc
   `mt-10/12`, and 5 inline patterns repeat 70+ times.

---

## Hard constraint: ZERO feature loss

No page deleted. No catalog dropped. `/recipes` is **built** (feature completion),
not removed. Nav items are **regrouped**, not cut. Shells are **unified**, content
untouched. Every current URL keeps working.

---

## Phased rollout (each phase independently shippable, low→high blast radius)

### Q0 — Fix the broken `/recipes` link  ·  ✅ SHIPPED
Reality on inspection: `lib/content/recipes` is a **deprecated empty shim** — all
recipes were migrated into `lib/content/slices`; the code comment even says "Routes
redirect `/recipes/<slug>` → `/slices/<slug>`" (intended, never built). So the fix is
**redirects, not a catalog** (no data to show):
- Added `app/(docs)/recipes/page.tsx` → `redirect("/slices")` and
  `recipes/[slug]/page.tsx` → `redirect("/slices/<slug>")` (preserves inbound links).
- Removed the dead Recipes section from the sidebar (Q1) — not feature loss, the
  feature lives at `/slices`.
- Cleaned `app/sitemap.ts`: dropped the `/recipes` redirect URL; added the 4 real
  pages that were missing from the sitemap (best-practice, audit-chain, control-room,
  changelog).

### Q1 — Unify navigation into clusters  ·  ✅ SHIPPED
Sidebar rewritten from a 10-leaf "Get Started" dumping-ground + dead Recipes section
into **7 single-purpose sections**: Get Started (onboarding only) · Slices · Layouts ·
Website Templates · **Standards** (Best Practice + Audit Chain — previously
sidebar-invisible) · **Automation** (Agents/Build/MCP/Control-Room) · Releases
(Changelog). Top-navbar aligned to the same labels.
**Naming decision:** unified the public term to **"Slices"** everywhere (dropped the
navbar-only "Modules" relabel that split the taxonomy 3 ways: Modules/Slices/slice).
URL stays `/slices`. Added the missing **Templates** link to the navbar. *(Flag: if
you prefer "Modules" as the public noun, it's a one-word flip in 2 files.)*

| Cluster | Folds in |
|---|---|
| **Get Started** | Introduction `/docs` · Installation · Architecture · Stack · Directory |
| **Catalog** | Layouts · Slices · Templates · Bundle Builder `/build` · Recipes |
| **Standards** | Best Practice · Audit Chain |
| **Automation** | Install with Agent · MCP server · VPS Control Room |
| **Releases** | Changelog |

- Rewrite `build-sections.ts` to the 5-cluster tree.
- Align `top-navbar.tsx` to the same 5 cluster entry-points (resolve the
  "Modules" vs "Slices" label split — pick one term, use it everywhere).
- Surface: ships via main, no publish. Pure nav data + labels; no route changes.

### Q2 — Canonical `<PageHeader>` + shell discipline  ·  ✅ SHIPPED
Created `components/site/page-header.tsx` (eyebrow/title/description, `text-3xl`
title matched to CatalogHero). Adopted on 8 content pages (docs, best-practice,
directory, installation, agents, stack, architecture, mcp); eyebrows aligned to
the new cluster names. Stripped redundant `max-w-3xl` from directory, installation,
architecture, mcp, stack, control-room, audit-chain (DocsShell owns width). Killed
changelog `-mx-4`. Fixed architecture + stack h1 `text-4xl`→`text-3xl`. Normalized
`space-y-6`→`space-y-8` roots. **build left as-is** — it's an interactive tool
surface (compact toolbar header is correct, not a content doc).

*(original target below)*
- New `components/site/page-header.tsx`: `{ eyebrow, title, description }` →
  `text-3xl font-bold tracking-tight` h1, `text-sm text-muted-foreground` eyebrow,
  `text-base text-muted-foreground` desc. One header, everywhere.
- Adopt it on the 7 hand-rolled pages (docs, best-practice, directory, installation,
  agents, stack, architecture).
- **Remove redundant `max-w-3xl`** from mcp/architecture/directory/installation (let
  `DocsShell` own width). Kill changelog `-mx-4` (use the wide-layout flag instead).
  Fold build's custom header into `<PageHeader>`.
- Normalize page-root spacing to **`space-y-8`** (drop `space-y-6` + ad-hoc `mt-*`).
- Fix architecture h1 `text-4xl`→`text-3xl`; build eyebrow `text-[11px]`→`text-sm`.

### Q3 — Extract the 5 duplicated primitives  ·  *kill 70+ inline repeats*
- `<DocCard>` ← `rounded-lg border bg-card p-4` (×9) — or just use the existing
  shadcn `<Card>` consistently.
- `<SectionBlock title>` ← `mt-12 space-y-4` heading+body wrapper (×16).
- `.text-meta` utility ← `text-sm text-muted-foreground` (×39).
- List-item row + feature-grid wrappers (×6).
- Replace inline usages page-by-page. Reduces future drift; the new lint discipline
  from the slice work can later guard it.

### Q4 — Typography + token polish  ·  *small*
- Codify the scale (h1 `text-3xl` / h2 `text-2xl` / h3 `text-base` / meta `text-xs`);
  reserve display `text-5xl/7xl` for the home hero only.
- Remove the unused `--font-serif` fallback (docs never use serif — avoids accidental
  serif render). *(Note: slice components like hero/activity DO use `font-serif` —
  scope this to docs-site globals only, verify before touching.)*

---

## Sequence + risk

| Phase | Effort | Risk | Ships |
|---|---|---|---|
| Q0 recipes page | S | none (additive) | main |
| Q1 nav 5-cluster | M | low (nav data only) | main |
| Q2 PageHeader + shell | M | low-med (touches ~13 pages) | main |
| Q3 extract primitives | M | low (mechanical) | main |
| Q4 typography polish | S | low | main |

All ship to main via degit; **no npm publish** touched. Recommended order: Q0 → Q1
(the two that kill the "pusing" fastest) → Q2 → Q3 → Q4.

## Explicitly NOT doing
- No redesign of the token system / fonts (already coherent).
- No route deletions, no feature removal.
- No touching `app/preview/*` (component demos) or `app/admin/*` (separate surface).
